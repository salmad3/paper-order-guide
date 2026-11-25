import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const inspector = fileURLToPath(new URL('../lab/inspect.mjs', import.meta.url))
const base = { id: 'sample', status: 'partially_filled', qty: '10', filled_qty: '3' }

const cases = [
  { name: 'US stock with zero filled', fields: { asset_class: 'us_equity', filled_qty: '0' }, output: 'Filled: 0 of 10 shares' },
  { name: 'fractional shares retain precision', fields: { asset_class: 'us_equity', qty: '0.125000001', filled_qty: '0.000000001' }, output: 'Filled: 0.000000001 of 0.125000001 shares' },
  { name: 'earlier projection omits the asset class', fields: {}, output: 'Filled: 3 of 10 units' },
  { name: 'unclassified order', fields: { asset_class: '' }, output: 'Filled: 3 of 10 units' },
  { name: 'crypto', fields: { asset_class: 'crypto' }, error: 'Expected a US stock order' },
  { name: 'options', fields: { asset_class: 'us_option' }, error: 'Expected a US stock order' },
  { name: 'multi-leg options with an empty asset class', fields: { asset_class: '', order_class: 'mleg' }, error: 'Multi-leg orders' },
  { name: 'notional US stock order', fields: { asset_class: 'us_equity', notional: '20', qty: null }, error: 'notional amount' },
  { name: 'missing fill quantity', fields: { filled_qty: null }, error: 'decimal string for filled_qty' },
]

for (const { name, fields, output, error } of cases) {
  test(name, t => {
    const dir = mkdtempSync(join(tmpdir(), 'paper-order-'))
    t.after(() => rmSync(dir, { recursive: true, force: true }))
    const file = join(dir, 'order.json')
    writeFileSync(file, JSON.stringify({ ...base, ...fields }))
    const result = spawnSync(process.execPath, [inspector, file], { encoding: 'utf8' })
    assert.ifError(result.error)
    if (error) {
      assert.equal(result.status, 1)
      assert.ok(result.stderr.includes(error), result.stderr)
      assert.equal(result.stdout, '')
    } else {
      assert.equal(result.status, 0, result.stderr)
      assert.equal(result.stdout.trim().split('\n').at(-1), output)
    }
  })
}
