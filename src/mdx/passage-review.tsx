'use client'

import { useId, useRef, useState } from 'react'
import trial from '../../public/passage-trial.json'
import styles from './passage-review.module.css'

const [original, revision] = trial.runs

function RecordedPassage({ run }: { run: typeof original }) {
  return (
    <figure className={styles.passage}>
      <figcaption>
        <strong>{run.label}</strong>
        <span>Recorded result {run.rank} of {run.returned}</span>
      </figcaption>
      <blockquote>{run.excerpt}</blockquote>
    </figure>
  )
}

export function PassageReview() {
  const id = useId()
  const editor = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(original.excerpt)
  const [feedback, setFeedback] = useState('')

  async function copyDraft() {
    const field = editor.current
    if (!field || !field.value.trim()) return
    const text = field.value
    try {
      await navigator.clipboard.writeText(text)
      if (field.value === text) setFeedback('Draft copied.')
    } catch {
      if (field.value !== text) return
      field.focus()
      field.select()
      setFeedback('Draft selected. Use your device’s Copy command.')
    }
  }

  return (
    <section className={`not-prose ${styles.review}`} aria-label="Review a retrieved support passage">
      <header className={styles.ticket}>
        <strong>Customer ticket</strong>
        <p>“{trial.question}”</p>
      </header>

      <div className={styles.original}>
        <RecordedPassage run={original} />
        <p>Which claim would you need the customer’s order record to verify?</p>
      </div>

      <details className={styles.step}>
        <summary>Edit a copy</summary>
        <div className={styles.body}>
          <label htmlFor={id}>Your draft</label>
          <p id={`${id}-hint`} className={styles.hint}>
            This draft stays in this tab. To test it, copy it into your troubleshooting page, rebuild and run the same ticket.
          </p>
          <textarea
            id={id} ref={editor} aria-describedby={`${id}-hint`} rows={5}
            autoComplete="off" value={draft}
            onChange={event => {
              setDraft(event.target.value)
              setFeedback('')
            }}
          />
          <div className={styles.action}>
            <button type="button" onClick={copyDraft} disabled={!draft.trim()}>Copy draft</button>
            <span role="status">{feedback}</span>
          </div>
          <noscript>
            <style>{`.${styles.action} { display: none }`}</style>
            <p>Select your draft and use your device’s Copy command.</p>
          </noscript>
        </div>
      </details>

      <details className={styles.step}>
        <summary>Compare with the recorded revision</summary>
        <div className={styles.body}>
          <RecordedPassage run={revision} />
          <p>Thally returned the same heading first in both builds. The revision tells the reader how to find the customer’s quantity and gives the lab result as an example.</p>
          <table>
            <caption>Two synthetic orders with the same status</caption>
            <thead><tr><th scope="col">Order</th><th scope="col">Status</th><th scope="col">Shares filled</th></tr></thead>
            <tbody>
              {trial.records.map((record, index) => (
                <tr key={record.id}>
                  <th scope="row">{index === 0 ? 'Lab fixture' : 'Second fixture'}</th>
                  <td><code>{record.status}</code></td>
                  <td>{record.filled_qty} of {record.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
