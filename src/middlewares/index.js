const { player, admin } = require('./auth')
const { checkSchedule } = require('./schedule')

module.exports = {
  auth: { player, admin },
  checkSchedule
}
