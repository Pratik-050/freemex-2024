const { DataTypes } = require('sequelize')

/**
 * Define Transaction model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Transaction', {
    type: {
      type: DataTypes.ENUM('bought', 'sold'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false
    },
    netProfit: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false
    }
  })
  console.log('Defining Transaction model successful.')
}
