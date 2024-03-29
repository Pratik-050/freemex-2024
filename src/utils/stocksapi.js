/**
 * Fake Stocks API, to test the application,
 * whenever it isn't possible with the actual
 * Stocks API.
 */
async function fakeStocksDataFactory (instances) {
  const stocks = []
  for (let i = 0; i < instances.length; i++) {
    stocks.push({
      code: instances[i].code,
      latestPrice: Math.floor(Math.random() * 2001),
      change: Math.random().toFixed(2),
      changePercent: Math.random().toFixed(5),
      latestUpdate: new Date()
    })
  }
  return stocks
}

module.exports = {
  fakeStocksDataFactory
}

if (require.main === module) {
  /**
  * Gets executed when invoked directly.
  *
  * Can be used to visualize the output
  * of fake Stocks API.
  */
  const symbols = process.argv.length > 2 ? process.argv.slice(2) : ['GOOG']
  const instances = symbols.map((symbol) => ({ code: symbol }))
  fakeStocksDataFactory(instances)
    .then(data => console.log(data))
    .catch(error => console.log(error))
}
