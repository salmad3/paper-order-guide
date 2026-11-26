'use client'

import { useState, type ReactNode } from 'react'

const cuts = [
  { name: 'wide', suffix: '', display: 'hidden sm:block', aspect: 'aspect-[8/5]' },
  { name: 'phone', suffix: '-mobile', display: 'block sm:hidden', aspect: 'mx-auto aspect-[15/32] landscape:max-w-[40svh]' },
] as const

export function GuideWalkthrough({ children }: { children: ReactNode }) {
  // Keep the current take and playback position when the viewer rotates the phone.
  const [startedCut, setStartedCut] = useState<(typeof cuts)[number]['name'] | null>(null)

  return (
    <figure id="walkthrough" className="not-prose mt-9 scroll-mt-24">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 [&_a]:text-sm [&_a]:underline [&_a]:underline-offset-4">
        <strong id="walkthrough-title" className="text-base font-semibold">
          Paper Order Guide walkthrough
        </strong>
        {children}
      </figcaption>
      {cuts.map(({ name, suffix, display, aspect }) => (
        <video
          key={name}
          aria-labelledby="walkthrough-title"
          className={`${startedCut ? (startedCut === name ? 'block' : 'hidden') : display} ${aspect} w-full rounded-lg`}
          controls
          playsInline
          poster={`/walkthrough/poster${suffix}.jpg`}
          preload="none"
          onPlay={() => setStartedCut(name)}
        >
          <source src={`/walkthrough/paper-order-guide${suffix}.mp4`} type="video/mp4" />
          <track src={`/walkthrough/paper-order-guide${suffix}.vtt`} kind="captions" srcLang="en" label="English" />
          <a href={`/walkthrough/paper-order-guide${suffix}.mp4`}>Download the video</a>
        </video>
      ))}
    </figure>
  )
}
