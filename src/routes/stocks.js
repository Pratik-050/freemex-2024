const { Router } = require('express')
const { models: { Stock } } = require('../models')

const router = Router()

router.route('/')
  .get((req, res, next) => {
    Stock.findAll()
      .then((stocks) => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        Stocks: stocks.map((stock) => ({
          ...stock.toJSON(),
          createdAt: undefined
        }))
      }))
      .catch(next)
  })

module.exports = router
