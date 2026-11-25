// Run from a terminal: node search-passages.mjs SITE "support question"
const [origin, ...words] = process.argv.slice(2)
const question = words.join(' ').trim()

async function search() {
  if (!origin || !question) throw new Error('Usage: node search-passages.mjs SITE "support question"')
  const url = new URL('/api/mcp', origin)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'search_sections', arguments: { query: question, limit: 3 } }
    }),
    signal: AbortSignal.timeout(15000)
  })
  if (!response.ok) {
    const retry = response.headers.get('Retry-After')
    throw new Error('HTTP ' + response.status + ' from ' + url + (retry ? ' (retry after ' + retry + ')' : ''))
  }
  const message = await response.json()
  if (message.error) throw new Error(message.error.message)
  if (message.result?.isError) throw new Error(message.result.content?.[0]?.text || 'Thally reported a tool error')
  const hits = message.result?.structuredContent?.results
  if (!Array.isArray(hits)) throw new Error('Missing ranked results in the Thally response')
  console.log('Search:', question)
  console.log('Endpoint:', url.href)
  if (!hits.length) console.log('No passages returned.')
  for (const [index, hit] of hits.entries()) {
    console.log('\n' + (index + 1) + '. ' + hit.heading)
    console.log(hit.section_url)
    console.log(hit.content)
  }
}

search().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
