'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

type Surface = 'pages' | 'sections'

interface NativeHit {
  title: string
  heading?: string
  url: string
  section_url?: string
  snippet?: string
  content?: string
}

type SearchResult =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; hits: NativeHit[] }

const idle: Record<Surface, SearchResult> = { pages: { status: 'idle' }, sections: { status: 'idle' } }

async function requestResults(surface: Surface, query: string, signal: AbortSignal): Promise<NativeHit[]> {
  const params = new URLSearchParams({ q: query, limit: '8', mode: 'fulltext' })
  const response = surface === 'pages'
    ? await fetch('/api/search?' + params, { signal })
    : await fetch('/api/mcp', {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'tools/call',
          params: { name: 'search_sections', arguments: { query, limit: 3 } },
        }),
      })

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    const seconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : null
    throw new Error(seconds ? `Rate limit reached. Try again in ${seconds} seconds.` : 'Rate limit reached. Try again in a minute.')
  }
  if (!response.ok) throw new Error(`The endpoint returned HTTP ${response.status}. Run the search again to retry.`)
  const data = await response.json()
  if (data.error || data.result?.isError) throw new Error(data.error?.message || data.result?.content?.[0]?.text || 'The search tool returned an error.')
  const hits = surface === 'pages' ? data.results : data.result?.structuredContent?.results
  if (!Array.isArray(hits)) throw new Error('The endpoint returned an unreadable result.')
  return hits
}

function hitLink(hit: NativeHit) {
  const url = new URL(hit.section_url || hit.url, window.location.href)
  // A local preview and its canonical address may have different hosts. Only carry the site path across.
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname.startsWith('//')) return undefined
  return url.pathname + url.search + url.hash
}

function Excerpt({ text }: { text: string }) {
  return (
    <div data-native-excerpt className="mt-2 space-y-2 break-words text-sm leading-6 text-foreground/80">
      {text.split(/(`{3}[^\n]*\n[\s\S]*?(?:`{3}|$))/g).filter(Boolean).map((part, i) => {
        if (!part.startsWith('```')) return <p key={i} className="whitespace-pre-line">{part.trim()}</p>
        const code = part.slice(part.indexOf('\n') + 1).replace(/\n?`{3}$/, '')
        return <pre key={i} className="overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs"><code>{code}</code></pre>
      })}
    </div>
  )
}

function Hit({ hit, pages }: { hit: NativeHit; pages: boolean }) {
  const label = pages ? hit.title : hit.heading || hit.title
  const context = pages ? hit.heading : hit.title
  return (
    <>
      <a href={hitLink(hit)} className="font-semibold text-accent underline underline-offset-2">{label}</a>
      {context && context !== label && <p className="mt-1 text-xs text-foreground/65">{context}</p>}
      <Excerpt text={hit.content || hit.snippet || ''} />
    </>
  )
}

function NativeResults({ surface, result }: { surface: Surface; result: SearchResult }) {
  const pages = surface === 'pages'
  const label = pages ? 'Page search' : 'Section search'
  const hits = result.status === 'ready' ? result.hits : []
  const [first, ...rest] = hits
  return (
    <section data-search-surface={surface} data-status={result.status} aria-label={label} className="min-w-0">
      <h4 className="text-base font-semibold text-foreground">{label}</h4>
      <p className="mt-1 font-mono text-xs text-foreground/65">{pages ? 'GET /api/search · fulltext' : 'POST /api/mcp · search_sections'}</p>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-foreground/70">
        {result.status === 'loading' && 'Searching…'}
        {result.status === 'error' && result.message}
        {result.status === 'ready' && (first ? `First of ${hits.length} returned` : 'No matches for this question.')}
      </p>
      {first && (
        <div className="mt-1" data-result-rank="1">
          <Hit hit={first} pages={pages} />
        </div>
      )}
      {rest.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-foreground/80">See the other {rest.length === 1 ? 'result' : `${rest.length} results`}</summary>
          <ol start={2} className="mt-2 list-decimal space-y-2 pl-5">
            {rest.map((hit, index) => (
              <li key={index} data-result-rank={index + 2}>
                <Hit hit={hit} pages={pages} />
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  )
}

export function SectionSearch({ children: question }: { children: string }) {
  const id = useId()
  const [query, setQuery] = useState(question)
  const [results, setResults] = useState(idle)
  const active = useRef<AbortController | null>(null)

  useEffect(() => {
    const sharedQuestion = new URLSearchParams(window.location.search).get('q')?.trim()
    if (sharedQuestion) setQuery(sharedQuestion)
    return () => active.current?.abort()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = query.trim()
    if (value.length < 2) return
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(18000)])
    setResults({ pages: { status: 'loading' }, sections: { status: 'loading' } })
    await Promise.all((['pages', 'sections'] as const).map(async surface => {
      let result: SearchResult
      try {
        result = { status: 'ready', hits: await requestResults(surface, value, signal) }
      } catch (error) {
        if (controller.signal.aborted) return
        const message = signal.aborted ? 'The request timed out. Run the search again to retry.'
          : error instanceof Error ? error.message : 'Could not reach the endpoint.'
        result = { status: 'error', message }
      }
      if (!controller.signal.aborted) setResults(previous => ({ ...previous, [surface]: result }))
    }))
  }

  return (
    <div data-native-section-search className="not-prose my-2 min-w-0">
      <form action="/api/search" method="get" onSubmit={submit} className="space-y-3">
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">Search question</label>
        <textarea
          id={id} name="q" rows={3} value={query} required minLength={2} data-search-question
          className="block w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={event => {
            active.current?.abort()
            setQuery(event.target.value)
            setResults(idle)
          }}
        />
        <input type="hidden" name="mode" value="fulltext" />
        <input type="hidden" name="limit" value="8" />
        <button type="submit" data-search-submit disabled={query.trim().length < 2}
          className="inline-flex min-h-9 items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          Run search
        </button>
        <noscript><p className="text-sm">The form opens Thally’s page-search response. Enable JavaScript to compare it with section search.</p></noscript>
      </form>
      {results.pages.status !== 'idle' && (
        <div className="mt-5 grid min-w-0 gap-6 border-t border-border pt-4 sm:grid-cols-2">
          <NativeResults surface="pages" result={results.pages} />
          <NativeResults surface="sections" result={results.sections} />
        </div>
      )}
    </div>
  )
}
