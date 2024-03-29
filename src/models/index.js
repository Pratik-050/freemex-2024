const { Sequelize } = require('sequelize')

// Create connection object
const sequelize = new Sequelize({
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  logging: process.env.SEQUELIZE_LOGGING === 'false' ? false : console.log
})

// Define models
const modelDefiners = [
  require('./players'),
  require('./assets'),
  require('./stocks'),
  require('./transactions'),
  require('./schedules')
]

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize)
}

// Define associations
const { models: { Player, Asset, Stock, Transaction } } = sequelize
try {
  // Each player can have many assets
  Player.hasMany(Asset, {
    foreignKey: {
      allowNull: false
    }
  })
  Asset.belongsTo(Player)

  // Each asset is related to one stock
  Stock.hasMany(Asset, {
    foreignKey: {
      allowNull: false
    }
  })
  Asset.belongsTo(Stock)

  // Each player can have many transactions
  Player.hasMany(Transaction, {
    foreignKey: {
      allowNull: false
    }
  })
  Transaction.belongsTo(Player)

  // Each transaction is related to one stock
  Stock.hasMany(Transaction, {
    foreignKey: {
      allowNull: false
    }
  })
  Transaction.belongsTo(Stock)

  /**
   * A transaction being related to an asset
   * indicates that it's quantity
   * contributes to the asset's quantity.
   *
   * A transaction being in with no relation to
   * an asset indicates that it is either
   * not of type `bought` or it's quantity
   * has no contribution in the asset's
   * quantity.
   */
  // Each asset can have many transactions
  Asset.hasMany(Transaction, {
    foreignKey: {
      // There can be a transaction
      // with no relation to asset.
      allowNull: true
    }
  })
  Transaction.belongsTo(Asset)
} catch (error) {
  console.log('Unable to define associations:', error)
}

module.exports = sequelize
