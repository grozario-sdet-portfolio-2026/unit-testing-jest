const { database } = require('../databaseConnection')

/**
 * Creates a new restaurant in the database
 * @param {Object} restaurantData - Restaurant information
 * @param {string} restaurantData.name - Restaurant name
 * @param {string} restaurantData.address - Restaurant address
 * @param {number} restaurantData.capacity - Seating capacity
 * @param {number} restaurantData.latitude - (optional) Geographic latitude
 * @param {number} restaurantData.longitude - (optional) Geographic longitude
 * @returns {Promise<Object>} Created restaurant with ID
 */
const createRestaurant = (restaurantData) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO restaurants (name, address, latitude, longitude, capacity)
      VALUES (?, ?, ?, ?, ?)
    `
    const queryParameters = [
      restaurantData.name,
      restaurantData.address,
      restaurantData.latitude || null,
      restaurantData.longitude || null,
      restaurantData.capacity
    ]

    database.run(insertQuery, queryParameters, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ id: this.lastID, ...restaurantData })
      }
    })
  })
}

/**
 * Retrieves all restaurants from the database
 * @returns {Promise<Array>} Array of all restaurants
 */
const getAllRestaurants = () => {
  return new Promise((resolve, reject) => {
    const selectQuery = 'SELECT * FROM restaurants'
    database.all(selectQuery, (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows || [])
      }
    })
  })
}

/**
 * Retrieves a specific restaurant by ID
 * @param {number} restaurantId - ID of the restaurant
 * @returns {Promise<Object>} Restaurant object or undefined
 */
const getRestaurantById = (restaurantId) => {
  return new Promise((resolve, reject) => {
    const selectQuery = 'SELECT * FROM restaurants WHERE id = ?'
    database.get(selectQuery, [restaurantId], (error, row) => {
      if (error) {
        reject(error)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Updates an existing restaurant
 * @param {number} restaurantId - ID of the restaurant to update
 * @param {Object} restaurantData - Updated restaurant information
 * @returns {Promise<Object>} Updated restaurant object
 */
const updateRestaurant = (restaurantId, restaurantData) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE restaurants 
      SET name = ?, address = ?, latitude = ?, longitude = ?, capacity = ?
      WHERE id = ?
    `
    const queryParameters = [
      restaurantData.name,
      restaurantData.address,
      restaurantData.latitude,
      restaurantData.longitude,
      restaurantData.capacity,
      restaurantId
    ]

    database.run(updateQuery, queryParameters, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ id: restaurantId, ...restaurantData })
      }
    })
  })
}

/**
 * Deletes a restaurant from the database
 * @param {number} restaurantId - ID of the restaurant to delete
 * @returns {Promise<Object>} Result object with number of deleted rows
 */
const deleteRestaurant = (restaurantId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = 'DELETE FROM restaurants WHERE id = ?'
    database.run(deleteQuery, [restaurantId], function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ deletedCount: this.changes })
      }
    })
  })
}

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
}
