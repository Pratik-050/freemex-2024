const { Router } = require('express')
const { models: { Transaction, Stock, Asset } } = require('../models')

const NO_SELL_PERIOD = parseInt(process.env.NO_SELL_PERIOD) || 20 * 60 * 1000 // 20 min

const router = Router()

router.route('/')
  .get((req, res, next) => {
    req.user.getTransactions({
      include: {
        model: Stock,
        attributes: ['name', 'code']
      }
    })
      .then(transactions => res.status(200).json({
        message: `GET ${req.originalUrl} success.`,
        transactions: transactions.map((transaction) => ({
          ...transaction.toJSON(),
          id: undefined,
          PlayerId: undefined,
          StockId: undefined,
          updatedAt: undefined
        }))
      }))
      .catch(next)
  })
  .post(async (req, res) => {
    if (!req.query.type || !req.body.code || !req.body.quantity) {
      res.status(400).json({
        message: 'Bad request, missing required data',
        query: req.query,
        body: req.body
      })
      return
    }
    if (!(Transaction.rawAttributes.type.values.indexOf(req.query.type) > -1)) {
      res.status(404).json({
        message: `Transaction type ${req.query.type} not found`,
        query: req.query,
        body: req.body
      })
      return
    }

    const type = req.query.type
    const code = req.body.code
    const quantity = parseInt(req.body.quantity)
    if (quantity <= 0 || !Number.isInteger(Number(req.body.quantity))) {
      res.status(403).json({
        message: 'Only positive integer value for quantity are supported',
        query: req.query,
        body: req.body
      })
      return
    }
    const stock = await Stock.findOne({
      attributes: ['id', 'latestPrice'],
      where: {
        code
      }
    })
    if (stock === null) {
      res.status(404).json({
        message: `Stock of code ${code} not found`,
        query: req.query,
        body: req.body
      })
      return
    }
    const transaction = Transaction.build({
      type,
      quantity,
      price: stock.latestPrice,
      StockId: stock.id,
      PlayerId: req.user.id
    })
    const [asset, isNew] = await Asset.findOrBuild({
      where: {
        StockId: stock.id,
        PlayerId: req.user.id
      }
    })

    /**
     * Forcefully typecast DECIMAL into float (number).
     * https://github.com/sequelize/sequelize/issues/8019
     */
    stock.latestPrice = parseFloat(stock.latestPrice)
    asset.invested = parseFloat(asset.invested)
    asset.netProfit = parseFloat(asset.netProfit)
    req.user.valueInCash = parseFloat(req.user.valueInCash)
    req.user.valueInStocks = parseFloat(req.user.valueInStocks)
    req.user.valueInTotal = parseFloat(req.user.valueInTotal)

    const transactionAmount = stock.latestPrice * quantity

    switch (type) {
      case 'bought': {
        if (!(req.user.valueInCash >= transactionAmount)) {
          res.status(403).json({
            message: 'Forbidden, Not enough cash',
            query: req.query,
            body: req.body
          })
          return
        }
        transaction.netProfit = 0
        asset.quantity += quantity
        asset.invested += transactionAmount
        req.user.valueInCash -= transactionAmount
        req.user.valueInStocks += transactionAmount
        if (!isNew) {
          transaction.AssetId = asset.id
        }
        break
      }
      case 'sold': {
        if (isNew || quantity > asset.quantity) {
          res.status(403).json({
            message: 'Forbidden, ' + (
              isNew
                ? `You don't have an asset for ${code}`
                : `You have only ${asset.quantity} stocks`
            ),
            query: req.query,
            body: req.body
          })
          return
        }

        const transactions = await asset.getTransactions({
          order: [['createdAt', 'ASC']],
          attributes: [
            'id', 'quantity', 'createdAt'
          ]
        })
        const popTransactionIds = []
        const now = (new Date()).getTime()
        let proxyQuantity = quantity - asset.quantity + (
          // sum of `quantity` column.
          transactions.reduce((a, b) => a + b.quantity, 0)
        )

        /**
         * Check if the requested quantity of stocks satisfy
         * the `NO_SELL_PERIOD`, if not terminate the transaction.
         *
         * Analogically, pop out transactions from the asset
         * queue, until atmost `proxyQuantity` quantity of stocks
         * gets poped
         * (If there's some non zero quantity of stocks left in a
         * transaction, then it doesn't pop out, but constitutes to
         * next `sold` transaction).
         */
        for (const _transaction of transactions) {
          if (
            proxyQuantity !== 0 &&
            now < _transaction.createdAt.getTime() + NO_SELL_PERIOD
          ) {
            res.status(403).json({
              message: `Forbidden, at least wait for ${NO_SELL_PERIOD}ms before selling.`,
              atleastWaitPeriod: (
                _transaction.createdAt.getTime() + NO_SELL_PERIOD - now
              )
            })
            return
          }
          if (proxyQuantity < _transaction.quantity) {
            break
          }
          popTransactionIds.push(_transaction.id)
          proxyQuantity -= _transaction.quantity
        }
        if (popTransactionIds.length > 0) {
          await Transaction.update({ AssetId: null }, {
            where: {
              id: popTransactionIds
            }
          })
        }

        const costBasis = quantity * (asset.invested) / (asset.quantity)
        transaction.netProfit = transactionAmount - costBasis
        asset.quantity -= quantity
        asset.invested -= costBasis
        req.user.valueInCash += transactionAmount
        req.user.valueInStocks -= costBasis
        break
      }
    }

    asset.netProfit += transaction.netProfit
    req.user.valueInTotal = req.user.valueInCash + req.user.valueInStocks

    // TODO - Handle the situation when any errors
    //        are thrown, by undoing any instances
    //        that may have been updated.
    await req.user.save()
    await transaction.save()
    await asset.save()

    if (isNew && type === 'bought') {
      await transaction.setAsset(asset)
    }

    res.status(200).json({
      message: `POST ${req.originalUrl} success.`,
      transaction: {
        ...transaction.toJSON(),
        id: undefined,
        PlayerId: undefined,
        StockId: undefined,
        updatedAt: undefined
      },
      asset: {
        ...asset.toJSON(),
        id: undefined,
        PlayerId: undefined,
        StockId: undefined,
        createdAt: undefined
      },
      Stock: {
        code
      }
    })
  })

module.exports = router
