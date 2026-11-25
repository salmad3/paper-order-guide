import { Tab, Tabs } from '@/components/mdx/content-tabs'
import accepted from '../../lab/fixtures/accepted.json'
import partial from '../../lab/fixtures/partial.json'
import canceled from '../../lab/fixtures/canceled.json'
import styles from './order-snapshots.module.css'

const snapshots = [
  { label: 'Accepted', file: 'accepted.json', order: accepted },
  { label: 'Partial fill', file: 'partial.json', order: partial },
  { label: 'Canceled', file: 'canceled.json', order: canceled },
]

export function OrderSnapshots() {
  return (
    <figure className={`not-prose ${styles.figure}`} aria-label="Three snapshots of one sample order">
      <figcaption className={styles.caption}>
        <strong>How many shares filled?</strong>
        <span>One synthetic order. Each mark represents one requested share.</span>
      </figcaption>

      <Tabs className={styles.tabs}>
        {snapshots.map(({ label, file, order }, index) => {
          const total = Number(order.qty)
          const filled = Number(order.filled_qty)
          const remainder = total - filled
          const isCanceled = order.status === 'canceled'
          const previous = snapshots[index - 1]?.order
          return (
            <Tab key={file} title={label} id={`snapshot-${order.status.replaceAll('_', '-')}`}>
              <div className={styles.panel}>
                <div className={styles.measure}>
                  <strong>{filled}</strong> <span>of {total} shares filled</span>
                </div>
                <div className={styles.marks} aria-hidden="true">
                  {Array.from({ length: total }, (_, share) => (
                    <span key={share} className={share < filled ? styles.filled : isCanceled ? styles.canceled : styles.unfilled} />
                  ))}
                </div>
                <div className={styles.key}>
                  <span><i className={styles.filled} aria-hidden="true" />{filled} filled</span>
                  <span><i className={isCanceled ? styles.canceled : styles.unfilled} aria-hidden="true" />{remainder} {isCanceled ? 'canceled' : 'unfilled'}</span>
                </div>
                <p className={styles.reading}>
                  {!previous ? (
                    <>The API received the order. Its <code>filled_qty</code> starts at <code>{order.filled_qty}</code> in this sample.</>
                  ) : previous.filled_qty === order.filled_qty ? (
                    <>The status changed to <code>{order.status}</code>. The earlier fills still count, so <code>filled_qty</code> stays at <code>{order.filled_qty}</code>.</>
                  ) : (
                    <>The order ID is the same. Its <code>filled_qty</code> rose from <code>{previous.filled_qty}</code> to <code>{order.filled_qty}</code>.</>
                  )}
                </p>
                <details className={styles.source}>
                  <summary>View fixture JSON <code>{file}</code></summary>
                  <pre><code>{JSON.stringify(order, null, 2)}</code></pre>
                </details>
              </div>
            </Tab>
          )
        })}
      </Tabs>
      <noscript>
        <style>{`.${styles.tabs} { display: none }`}</style>
        <table className={styles.staticTable}>
          <thead><tr><th scope="col">Snapshot</th><th scope="col">Filled</th><th scope="col">Remainder</th></tr></thead>
          <tbody>
            {snapshots.map(({ order, label }) => (
              <tr key={order.status}><th scope="row">{label}</th><td>{order.filled_qty} of {order.qty}</td><td>{Number(order.qty) - Number(order.filled_qty)} {order.status === 'canceled' ? 'canceled' : 'unfilled'}</td></tr>
            ))}
          </tbody>
        </table>
      </noscript>
    </figure>
  )
}
