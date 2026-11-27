const film = document.getElementById('film')
const list = document.getElementById('chapters')

async function loadChapters() {
  const response = await fetch('/walkthrough/chapters.json')
  if (!response.ok) return
  const chapters = await response.json()
  const links = chapters.map(chapter => {
    const link = document.createElement('a')
    const time = document.createElement('time')
    const seconds = Math.floor(chapter.wide)
    time.dateTime = 'PT' + seconds + 'S'
    time.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
    link.href = '/walkthrough/paper-order-guide.mp4#t=' + chapter.wide
    link.append(time, document.createTextNode(chapter.label))
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      event.preventDefault()
      film.currentTime = chapter.wide
      film.play().catch(() => film.focus())
    })
    const item = document.createElement('li')
    item.append(link)
    list.append(item)
    return link
  })

  function markChapter() {
    const next = chapters.findIndex(chapter => chapter.wide > film.currentTime)
    const active = next === -1 ? chapters.length - 1 : Math.max(0, next - 1)
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'time')
      else link.removeAttribute('aria-current')
    })
  }

  markChapter()
  film.addEventListener('timeupdate', markChapter)
  list.closest('nav').hidden = false
}

// Native playback, captions, downloads and the transcript work without chapter data.
loadChapters().catch(() => {})
