// Compare the actual docs interface, downloads and MCP service on a running local preview.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import matter from 'gray-matter'
import { mdxToMarkdown } from '@thallylabs/core/markdown'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { capture: { type: 'boolean' }, profile: { type: 'string', default: 'next' } }
})
assert.ok(positionals.length <= 1, 'Usage: node checks/verify-guide.mjs [origin] [--capture] [--profile next|worker]')
const origin = new URL(positionals[0] || 'http://localhost:3041')
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname), 'Use a local preview URL')
const hash = data => createHash('sha256').update(data).digest('hex')
const questionsFile = await readFile(new URL('./retrieval-cases.json', import.meta.url))
const probesFile = await readFile(new URL('./retrieval-probes.json', import.meta.url))
const questions = [...JSON.parse(questionsFile).cases, ...JSON.parse(probesFile).cases]
const pagePath = id => id === 'introduction' ? '/' : '/' + id
const reference = url => { const {pathname, hash} = new URL(url); return pathname + hash }
const pages = new Map()
let requestId = 0

async function fetchPath(path, options) {
  const request = () => fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000), ...options })
  let response = await request()
  if (response.status === 429) {
    const seconds = Number(response.headers.get('retry-after') ?? '60')
    assert.ok(Number.isFinite(seconds) && seconds >= 0 && seconds <= 120, 'Unexpected retry interval')
    await response.body?.cancel()
    await new Promise(resolve => setTimeout(resolve, (seconds + 1) * 1000))
    response = await request()
  }
  assert.equal(response.status, 200, path + ' returned ' + response.status)
  return response
}

async function rpc(method, params) {
  const id = ++requestId
  const response = await fetchPath(endpoint.pathname, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Accept:'application/json, text/event-stream' },
    body: JSON.stringify({jsonrpc:'2.0', id, method, params})
  })
  const message = await response.json()
  assert.equal(message.id, id)
  assert.ok(message.result && !message.result.isError, method + ' failed: ' + JSON.stringify(message.error ?? message.result))
  return message.result
}
async function callTool(name, args) {
  const result = await rpc('tools/call', { name, arguments: args })
  assert.ok(result.structuredContent, 'Missing structured result for ' + name)
  return result.structuredContent
}
function checkTarget(hit) {
  const page = pages.get(hit.page_id)
  assert.ok(page && hit.page_id !== appendix, 'Unexpected search hit ' + hit.page_id)
  const target = reference(hit.section_url || hit.url)
  const [path, anchor] = target.split('#')
  assert.equal(path, pagePath(hit.page_id), 'Wrong page in search URL')
  if (anchor) {
    assert.ok(page.html.includes('id="' + anchor + '"'), 'Broken result fragment ' + target)
    assert.ok(page.headings.some(h => h.id === anchor && h.text === hit.heading), 'MCP page outline disagrees with the search citation ' + target)
  }
  return target
}

const appendix = 'guides/check-your-build'
const expectedIds = ['introduction','quickstart','guides/check-an-order','guides/publish-with-thally','guides/agent-access']
const manifest = await (await fetchPath('/.well-known/mcp.json')).json()
const discovery = await (await fetchPath('/ai.txt')).text()
assert.equal(discovery.match(/^Docs-MCP:\s*(\S+)$/m)?.[1], manifest.endpoint, 'Agent discovery and MCP manifest point to different servers')
const endpoint = new URL(manifest.endpoint)
assert.equal(endpoint.pathname, '/api/mcp')
await rpc('initialize', {protocolVersion:'2025-11-25', capabilities:{}, clientInfo:{name:'paper-order-guide-check', version:'1'}})
const registry = await rpc('tools/list', {})
for (const name of ['list_pages','read_page','search_sections']) {
  const tool = registry.tools.find(t => t.name === name)
  assert.ok(tool?.annotations?.readOnlyHint, 'Expected a read-only documentation tool ' + name)
  assert.ok(manifest.tools.some(t => t.name === name), 'MCP manifest omits ' + name)
}
const inventory = await callTool('list_pages', {})
assert.deepEqual(inventory.pages.map(page => page.page_id).sort(), [...expectedIds].sort(), 'Unexpected indexed pages')
for (const id of [...expectedIds, appendix]) {
  const path = pagePath(id)
  const html = await (await fetchPath(path)).text()
  const projection = await (await fetchPath(path + '?format=json')).json()
  const source = await readFile(new URL('../src/content/' + id + '.mdx', import.meta.url), 'utf8')
  const authored = matter(source)
  const expectedBody = mdxToMarkdown(authored.content, 'agents')
  assert.equal(projection.id, id)
  assert.equal(projection.title, authored.data.title, 'Published title differs from the checkout for ' + id)
  if (authored.data.keywords?.length) {
    assert.deepEqual(projection.meta.keywords, authored.data.keywords, 'Published keywords differ from the checkout for ' + id)
  }
  assert.equal(hash(projection.content.mdx.trim()), hash(expectedBody.trim()), 'Published Markdown differs from the checkout for ' + id)
  const directRead = await callTool('read_page', {pageId:id})
  assert.equal(directRead.page_id, id)
  assert.ok(projection.content.mdx.trim())
  assert.equal(hash(directRead.markdown), hash(projection.content.mdx), 'JSON and MCP bodies differ for ' + id)
  if (id === appendix) assert.match(html, /<meta name="robots" content="[^"]*noindex/)
  pages.set(id,{html, headings:directRead.headings, sourceSha256:hash(source)})
}
const artifacts = {}
for (const name of ['paper-order-lab.zip','order-guide-starter.zip','search-passages.mjs']) {
  const served = Buffer.from(await (await fetchPath('/' + name)).arrayBuffer())
  const expected = await readFile(new URL('../public/' + name, import.meta.url))
  assert.deepEqual(served, expected, 'Download differs from reviewed source ' + name)
  artifacts[name] = hash(served)
}

// Homepage links should be discoverable through the structured graph as well as in the rendered guide.
const home = await (await fetchPath('/?format=json')).json()
const homeLinks = new Set(home.content.links.map(link => link.url))
const expectedHomeLinks = [
  '/guides/check-an-order#read-the-filled-quantity-after-cancellation',
  '/guides/check-an-order#recover-the-order-after-a-lost-response',
  '/quickstart', '/quickstart#compare-the-next-two-snapshots', '/guides/publish-with-thally', '/guides/agent-access'
]
for (const path of expectedHomeLinks) {
  assert.ok(homeLinks.has(path), 'Homepage link missing from the JSON graph: ' + path)
  assert.ok(pages.get('introduction').html.includes('href="' + path + '"'), 'Homepage link missing from HTML: ' + path)
}

const agentQuestions = JSON.parse(await readFile(new URL('./agent-access-cases.json', import.meta.url)))
for (const {question, section} of agentQuestions) {
  const args = {query:question, limit:3}
  const pageHits = await callTool('search_docs', args)
  assert.equal(new URL(pageHits.results[0].url).pathname, '/guides/agent-access', 'First page for: ' + question)
  const sectionHits = await callTool('search_sections', args)
  assert.equal(checkTarget(sectionHits.results[0]), '/guides/agent-access#' + section, 'First citation for: ' + question)
}

const records = []
for (const {id,question} of questions) {
  const params = new URLSearchParams({q:question, mode:'fulltext', limit:'3'})
  const result = await (await fetchPath('/api/search?' + params)).json()
  assert.equal(result.mode, 'fulltext')
  assert.equal(result.query, question)
  const pageResults = result.results.map(hit => ({pageId:hit.page_id,path:checkTarget(hit)}))
  const response = await callTool('search_sections', {query:question,limit:3})
  assert.equal(response.query, question)
  assert.ok(response.results.length <= 3)
  const sections = response.results.map(hit => ({
    path:checkTarget(hit), heading:hit.heading, excerpt:hit.content
  }))
  records.push({id,question,pageResults,sections})
}

if (values.capture) {
  console.log(JSON.stringify({at:new Date().toISOString(),origin:origin.origin,profile:values.profile,
    questionsSha256:hash(questionsFile),probesSha256:hash(probesFile),indexed:expectedIds,artifacts,
    sources:Object.fromEntries([...pages].map(([id, page]) => [id, page.sourceSha256])),records},null,2))
} else {
  const receipt = JSON.parse(await readFile(new URL('./retrieval-replay.json', import.meta.url)))
  assert.equal(hash(questionsFile), receipt.questionsSha256, 'Reviewed questions changed')
  assert.equal(hash(probesFile), receipt.probesSha256, 'Reviewed supplemental probes changed')
  const observations = receipt.profiles[values.profile]
  assert.ok(observations, 'No reviewed replay for ' + values.profile)
  const signatures = records.map(({id,pageResults,sections}) => ({id,
    pages:pageResults.map(hit => hit.path),
    sections:sections.map(hit => ({path:hit.path,excerptSha256:hash(hit.excerpt)}))
  }))
  assert.deepEqual(signatures, observations, 'Native search changed. Inspect current passages with --capture before reviewing a new baseline.')
  console.log('Verified MCP discovery, ' + pages.size + ' page reads and their citations, three downloads, and both search interfaces for ' + records.length + ' reviewed questions on ' + values.profile + ', plus ' + expectedHomeLinks.length + ' homepage links and three agent tasks.')
}
