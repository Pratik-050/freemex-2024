const { DataTypes } = require('sequelize')

/**
 * Define Schedule model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Schedule', {
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })
  console.log('Defining Schedule model successful.')
}
