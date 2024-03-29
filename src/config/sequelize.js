const { STOCKS } = require('../utils/fixtures')

/**
 *
 * @param {Sequelize} sequelize
 */
module.exports = async (sequelize) => {
  /* Connect to DB */
  try {
    await sequelize.authenticate()
    console.log('DB Connection successful.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  /* Sync models to tables of DB */
  try {
    await sequelize.sync()
    console.log('DB Sync successful.')
  } catch (error) {
    console.error('Unable to sync:', error)
  }
  /* Preload Stocks table if empty */
  const { models: { Stock } } = sequelize
  if (await Stock.count()) {
    console.log('Stocks table is not empty')
  } else {
    try {
      await Stock.bulkCreate(STOCKS)
      console.log('Preload Stocks table successful.')
    } catch (error) {
      console.error('Unable to preload Stocks table:', error)
    }
  }
  /* Preload Schedules table if empty and if required env vars are set */
  const { models: { Schedule } } = sequelize
  if (await Schedule.count()) {
    console.log('Schedules table is not empty')
    return
  }
  try {
    const {
      SCHEDULE_START: start,
      SCHEDULE_END: end
    } = process.env
    if (!start || !end) {
      console.log(
        'Skipping preload of Schedules table `SCHEDULE_START` or `SCHEDULE_END` were not set'
      )
      return
    }
    await Schedule.create({ start, end })
    console.log('Preload Schedules table successful.', JSON.stringify({ start, end }))
  } catch (error) {
    console.error('Unable to preload Schedules table:', error)
  }
}
