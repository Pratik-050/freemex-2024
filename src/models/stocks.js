const { DataTypes } = require('sequelize')

/**
 * Define Stock model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Stock', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    latestPrice: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false
    },
    change: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false
    },
    changePercent: {
      type: DataTypes.DECIMAL(16, 5),
      allowNull: false
    },
    latestUpdate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })
  console.log('Defining Stock model successful.')
}
