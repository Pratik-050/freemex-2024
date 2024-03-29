const { models: { Schedule } } = require('../models')

const spareRoutes = [
  /**
   * Add routes (RegEx) to exclude.
   */
]

/**
 * Requests made before and after the event are rejected, except
 * if the requested route is in `spareRoutes`.
 *
 * Though, atleast one entry in Schedule table is required.
 */
async function checkSchedule (req, res, next) {
  const now = new Date()
  let started = false
  let ended = false
  try {
    const schedule = await Schedule.findOne({
      order: [['createdAt', 'DESC']]
    })
    if (schedule === null) {
      res.status(404).json({
        message: 'No schedule found, please contact admin.'
      })
      return
    }
    if (schedule.start.getTime() <= now.getTime()) {
      started = true
    }
    if (schedule.end.getTime() <= now.getTime()) {
      ended = true
    }
    if (
      !(spareRoutes.some((route) => (
        route.test(`${req.method} ${req.originalUrl}`)
      ))) &&
      (!started || ended)
    ) {
      res.status(403).json({
        message: 'Forbidden, for the given schedule, ' + (
          ended
            ? 'the event has ended.'
            : 'the event has not started yet.'
        ),
        schedule
      })
      return
    }
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = { checkSchedule }
