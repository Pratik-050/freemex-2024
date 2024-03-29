const { DataTypes } = require('sequelize')

/**
 * Define Asset model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Asset', {
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    invested: {
      type: DataTypes.DECIMAL(16, 2),
      defaultValue: 0,
      allowNull: false
    },
    netProfit: {
      type: DataTypes.DECIMAL(16, 2),
      defaultValue: 0,
      allowNull: false
    }
  })
  console.log('Defining Asset model successful.')
}
