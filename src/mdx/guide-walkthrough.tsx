import type { ReactNode } from 'react'

export function GuideWalkthrough({ children }: { children: ReactNode }) {
  return (
    <figure id="walkthrough" className="not-prose mt-9 scroll-mt-24">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 [&_a]:text-sm [&_a]:underline [&_a]:underline-offset-4">
        <strong id="walkthrough-title" className="text-base font-semibold">
          Paper Order Guide walkthrough
        </strong>
        {children}
      </figcaption>
      <video
        aria-labelledby="walkthrough-title"
        className="block aspect-video w-full rounded-lg"
        controls
        playsInline
        poster="/walkthrough/poster.jpg"
        preload="none"
      >
        <source src="/walkthrough/paper-order-guide.mp4" type="video/mp4" />
        <track src="/walkthrough/paper-order-guide.vtt" kind="captions" srcLang="en" label="English" default />
        <a href="/walkthrough/paper-order-guide.mp4">Download the video</a>
      </video>
    </figure>
  )
}
