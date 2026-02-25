const { database, clearAllData } = require('./databaseConnection')
const restaurantRepository = require('./repositories/restaurantRepository')
const reservationRepository = require('./repositories/reservationRepository')

module.exports = {
  database,
  clearAllData,
  ...restaurantRepository,
  ...reservationRepository
}
