const { Op } = require('sequelize')
const { models: { Asset } } = require('../models')

const updatePlayersValueOptions = {
  where: {
    valueInStocks: {
      [Op.gt]: 0
    }
  },
  attributes: [
    'id',
    'valueInCash',
    'valueInStocks',
    'valueInTotal'
  ],
  include: {
    model: Asset,
    where: {
      quantity: {
        [Op.gt]: 0
      }
    },
    attributes: ['quantity', 'StockId']
  }
}

async function updatePlayersValue (players, stocks) {
  stocks = stocks.map((stock) => ({
    ...stock.toJSON(), latestPrice: parseFloat(stock.latestPrice)
  }))
  for (const player of players) {
    player.valueInStocks = 0
    player.valueInCash = parseFloat(player.valueInCash)
    for (const asset of player.Assets) {
      const stock = stocks.find(stock => stock.id === asset.StockId)
      player.valueInStocks += stock.latestPrice * asset.quantity
    }
    player.valueInTotal = player.valueInCash + player.valueInStocks
  }
  return players
}

function inBetween ({ start, end, offset }, { onlyHrs = false } = {}) {
  const day = 24 * 60 * 60 * 1000
  let now = new Date()

  now = now.getTime()
  start = start.getTime()
  end = end.getTime()

  offset = offset.getTime() % day

  if (onlyHrs) {
    now = now % day
    start = start % day
    end = end % day
    offset = offset % day
  }

  if (
    (
      start - offset < now
    ) && (
      now < end + offset
    )
  ) {
    return true
  }
  return false
}

module.exports = {
  updatePlayersValue,
  updatePlayersValueOptions,

  inBetween
}
