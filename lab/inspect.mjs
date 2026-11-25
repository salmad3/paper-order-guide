import { readFile } from 'node:fs/promises'

async function inspect(file) {
  if (!file) throw new Error('Usage: node inspect.mjs path/to/order.json')
  const order = JSON.parse(await readFile(file, 'utf8'))
  if (typeof order?.id !== 'string' || typeof order.status !== 'string') {
    throw new Error('Expected an order with id and status')
  }
  if (order.order_class === 'mleg') {
    throw new Error('Multi-leg orders are outside this US stock example')
  }
  const assetClass = order.asset_class
  if (assetClass != null && assetClass !== '' && assetClass !== 'us_equity') {
    throw new Error('Expected a US stock order (asset_class: us_equity)')
  }
  if (order.notional != null) {
    throw new Error('This example needs an order placed by share quantity. This one specifies a notional amount.')
  }
  for (const field of ['qty', 'filled_qty']) {
    if (typeof order[field] !== 'string' || !/^\d+(\.\d+)?$/.test(order[field])) {
      throw new Error('Expected a quantity-based order with a decimal string for ' + field)
    }
  }
  console.log('Order:', order.id)
  console.log('Status:', order.status)
  const unit = assetClass === 'us_equity' ? 'shares' : 'units'
  console.log('Filled:', order.filled_qty, 'of', order.qty, unit)
}
inspect(process.argv[2]).catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
