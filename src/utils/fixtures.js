const stockCodesAndNames = [
  /* 01 */ ['GOOG', 'Alphabet Inc - Class C'],
  /* 02 */ ['AAPL', 'Apple Inc'],
  /* 03 */ ['FB', 'Meta Platforms Inc - Class A'],
  /* 04 */ ['ORCL', 'Oracle Corp.'],
  /* 05 */ ['BIDU', 'Baidu Inc - ADR'],
  /* 06 */ ['QCOM', 'Qualcomm, Inc.'],
  /* 07 */ ['ADBE', 'Adobe Inc'],
  /* 08 */ ['INFY', 'Infosys Ltd - ADR'],
  /* 09 */ ['CTSH', 'Cognizant Technology Solutions Corp. - Class A'],
  /* 10 */ ['MSFT', 'Microsoft Corporation'],
  /* 11 */ ['AMZN', 'Amazon.com Inc.'],
  /* 12 */ ['INTC', 'Intel Corp.'],
  /* 13 */ ['CSCO', 'Cisco Systems, Inc.'],
  /* 14 */ ['EBAY', 'EBay Inc.'],
  /* 15 */ ['TXN', 'Texas Instruments Inc.'],
  /* 16 */ ['TSLA', 'Tesla Inc'],
  /* 17 */ ['NFLX', 'NetFlix Inc'],
  /* 18 */ ['NVDA', 'NVIDIA Corp'],
  /* 19 */ ['EA', 'Electronic Arts, Inc.']
]
const STOCKS = stockCodesAndNames.map(([code, name]) => (
  {
    name,
    code,
    latestPrice: 0,
    change: 0,
    changePercent: 0,
    latestUpdate: new Date()
  }
))
const CODES = stockCodesAndNames.map(([code]) => code)

module.exports = { STOCKS, CODES }
