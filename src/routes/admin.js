const { Router } = require('express')
const { pluralize } = require('inflection') // A dependency of `Sequelize`.
const { models } = require('../models')

const router = Router()

const spareRoutes = [
  /**
   * Add routes (RegEx) to exclude.
   * Eg. /^DELETE \/admin\/api\/players/
   */
]

router.get('/ping', (_req, res) => {
  res.status(200).send('pong')
})

router.use((req, res, next) => {
  if (
    spareRoutes.some((route) => (
      route.test(`${req.method} ${req.originalUrl}`)
    ))
  ) {
    res.sendStatus(404)
    return
  }
  next()
})

for (const [name, model] of Object.entries(models)) {
  const path = `/${pluralize(name.toLowerCase())}`
  router
    .use(path, (_req, res, next) => {
      res.locals.name = name
      next()
    })
    .route(path)
    /**
     * TODO - When a stable express 5 realeases, update request
     * handlers to remove try-catch.
     * Refer: https://expressjs.com/en/guide/error-handling.html
     */
    .get(async (req, res, next) => {
      try {
        const { options } = req.body
        res.locals.body = await model.findAll(options)
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .post(async (req, res, next) => {
      try {
        const { instance, options } = req.body
        res.locals.body = await model.create(instance, options)
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .put(async (req, res, next) => {
      try {
        const { instance, options } = req.body
        res.locals.body = await model.update(instance, options)
      } catch (error) {
        next(error)
        return
      }
      next()
    })
    .delete(async (req, res, next) => {
      try {
        const { options = {} } = req.body
        /**
         * To prevent destroy everything, refer:
         * https://sequelize.org/v6/manual/model-querying-basics.html#simple-delete-queries
         */
        options.truncate = false
        res.locals.body = await model.destroy(options)
      } catch (error) {
        next(error)
        return
      }
      next()
    })
}

router
  .use((req, res) => {
    if (res.locals.name && res.locals.body) {
      res.status(200).json({
        message: `${req.method} ${req.originalUrl} success.`,
        [res.locals.name]: res.locals.body
      })
      return
    }
    res.sendStatus(404)
  })
  .use((err, req, res, next) => {
    // Handle known errors, or pass on to next error handler.
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(403).json({
        message: `Unable to create ${res.locals.name} instance`,
        details: [err.original.detail] || err.errors.map(({ message }) => message),
        body: req.body
      })
      return
    }
    next(err)
  })

module.exports = router
