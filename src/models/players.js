const { DataTypes } = require('sequelize')

const FREECASH = parseInt(process.env.FREECASH) || 50000000

/**
 * Define Player model.
 * @param {Sequelize} sequelize - Sequelize connection object
 */
module.exports = (sequelize) => {
  sequelize.define('Player', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    valueInStocks: {
      type: DataTypes.DECIMAL(16, 2),
      defaultValue: 0,
      allowNull: false
    },
    valueInCash: {
      type: DataTypes.DECIMAL(16, 2),
      defaultValue: FREECASH,
      allowNull: false
    },
    valueInTotal: {
      type: DataTypes.DECIMAL(16, 2),
      defaultValue: FREECASH,
      allowNull: false
    },
    googleId: {
      type: DataTypes.STRING
    },
    githubId: {
      type: DataTypes.STRING
    }
  })
  console.log('Defining Player model successful.')
}
