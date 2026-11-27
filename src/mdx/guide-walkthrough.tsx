'use client'

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import chapters from '../../public/walkthrough/chapters.json'

const cuts = [
  { name: 'wide', suffix: '', display: 'hidden sm:block', width: 2160, height: 1576 },
  { name: 'phone', suffix: '-mobile', display: 'block sm:hidden', width: 780, height: 1744 },
] as const
type Cut = (typeof cuts)[number]['name']

function timestamp(seconds: number) {
  return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0')
}

function followClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

function cutDisplay(active: Cut | null, cut: typeof cuts[number]) {
  if (!active) return cut.display
  return active === cut.name ? 'block' : 'hidden'
}

export function GuideWalkthrough({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLAnchorElement>(null)
  const videos = useRef<Partial<Record<Cut, HTMLVideoElement | null>>>({})
  const [startedCut, setStartedCut] = useState<Cut | null>(null)
  const [current, setCurrent] = useState(0)
  const [theater, setTheater] = useState(false)

  // Keep the same native player, buffer, and playback position in both views.
  useEffect(() => {
    const panel = dialog.current
    if (!panel || typeof panel.showModal !== 'function') return
    const syncView = () => {
      const expand = location.hash === '#watch-guide'
      if (expand !== panel.matches(':modal')) {
        panel.close()
        if (expand) panel.showModal()
        else {
          panel.show()
          opener.current?.focus({ preventScroll: true })
        }
      }
      setTheater(expand)
    }
    syncView()
    window.addEventListener('hashchange', syncView)
    return () => window.removeEventListener('hashchange', syncView)
  }, [])

  function closeLargePlayer() {
    // Replacing the theater fragment avoids reopening it on the next Back.
    history.replaceState(history.state, '', '#walkthrough')
    dialog.current?.close()
    dialog.current?.show()
    setTheater(false)
    opener.current?.focus({ preventScroll: true })
  }

  return (
    <figure id="walkthrough" className="tour-figure not-prose mt-9 scroll-mt-24">
      <figcaption className="tour-caption">
        <strong id="walkthrough-title">Tour the Paper Order Guide</strong>
        <span className="tour-links">
          {cuts.map(cut => (
            <a key={cut.name} className={cutDisplay(startedCut, cut)}
              href={'/walkthrough/paper-order-guide' + cut.suffix + '.mp4'} onClick={event => {
                if (!followClick(event) || typeof dialog.current?.showModal !== 'function') return
                event.preventDefault()
                opener.current = event.currentTarget
                location.hash = 'watch-guide'
              }}>Open large player</a>
          ))}
          {children}
        </span>
      </figcaption>
      <dialog open ref={dialog} id="watch-guide" className="tour-screen"
        aria-labelledby={theater ? 'tour-dialog-title' : 'walkthrough-title'}
        onCancel={event => { event.preventDefault(); closeLargePlayer() }}>
        <div className="tour-toolbar">
          <strong id="tour-dialog-title">Tour the Paper Order Guide</strong>
          <span className="tour-links">
            <a href="/walkthrough/transcript.txt">Transcript</a>
            <button type="button" onClick={closeLargePlayer}>Back to guide</button>
          </span>
        </div>
        {cuts.map(cut => {
          const { name, suffix, width, height } = cut
          const media = '/walkthrough/paper-order-guide' + suffix
          return (
            <div key={name} className={cutDisplay(startedCut, cut)}>
              <div className="tour-layout">
                <video ref={node => { videos.current[name] = node }} aria-label="Paper Order Guide walkthrough"
                  width={width} height={height} controls playsInline preload="none"
                  poster={'/walkthrough/poster' + suffix + '.jpg'}
                  onPlay={() => setStartedCut(name)}
                  onTimeUpdate={event => {
                    const seconds = event.currentTarget.currentTime
                    setCurrent(chapters.reduce((active, chapter, i) => seconds >= chapter[name] ? i : active, 0))
                  }}>
                  <source src={media + '.mp4'} type="video/mp4" />
                  <track src={media + '.vtt'} kind="captions" srcLang="en" label="English" />
                  <track src={media + '-chapters.vtt'} kind="chapters" srcLang="en" label="Chapters" />
                  <a href={media + '.mp4'}>Download the video</a>
                </video>
                <nav className="tour-chapters" aria-label="Walkthrough chapters">
                  <strong>Chapters</strong>
                  <ol>
                    {chapters.map((chapter, i) => (
                      <li key={chapter.id}>
                        <a href={media + '.mp4#t=' + chapter[name]}
                          aria-current={startedCut && current === i ? 'time' : undefined}
                          onClick={event => {
                            const player = videos.current[name]
                            if (!player || !followClick(event)) return
                            event.preventDefault()
                            player.currentTime = chapter[name]
                            void player.play().catch(() => player.focus())
                            if (dialog.current?.matches(':modal')) dialog.current.scrollTop = 0
                            else if (player.getBoundingClientRect().top < 0) {
                              player.scrollIntoView({ block: 'start', behavior: 'instant' })
                            }
                          }}>
                          <span className="tour-time">{timestamp(chapter[name])}</span>
                          <span>{chapter.label}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          )
        })}
      </dialog>
    </figure>
  )
}
