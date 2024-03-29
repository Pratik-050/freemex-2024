const { Router } = require('express')
const { checkSchedule } = require('../middlewares')

const router = Router()

router.get('/ping', (_req, res) => {
  res.status(200).send('pong')
})

router.use('/schedules', require('./schedules'))
router.use('/players', require('./players'))
router.use(checkSchedule)
router.use('/stocks', require('./stocks'))
router.use('/assets', require('./assets'))
router.use('/transactions', require('./transactions'))

module.exports = {
  auth: require('./auth'),
  api: router,
  admin: require('./admin')
}
