/**
 * Reservation Repository
 */

const { database } = require('../databaseConnection')
const { RESERVATION_STATUS_CANCELLED } = require('../../../constants')

/**
 * Creates a new reservation in the database
 * @param {Object} reservationData - Reservation information
 * @param {number} reservationData.restaurant_id - ID of the restaurant
 * @param {string} reservationData.customer_name - Name of the customer
 * @param {number} reservationData.number_of_people - Number of people
 * @param {string} reservationData.reservation_date - Date in YYYY-MM-DD format
 * @param {string} reservationData.reservation_time - Time in HH:mm format
 * @param {string} reservationData.status - Reservation status (default: 'confirmed')
 * @returns {Promise<Object>} Created reservation with ID
 */
const createReservation = (reservationData) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO reservations 
      (restaurant_id, customer_name, number_of_people, reservation_date, reservation_time, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const queryParameters = [
      reservationData.restaurant_id,
      reservationData.customer_name,
      reservationData.number_of_people,
      reservationData.reservation_date,
      reservationData.reservation_time,
      reservationData.status || 'confirmed'
    ]

    database.run(insertQuery, queryParameters, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ id: this.lastID, ...reservationData })
      }
    })
  })
}

/**
 * Retrieves all reservations with associated restaurant names
 * @returns {Promise<Array>} Array of all reservations with restaurant information
 */
const getAllReservations = () => {
  return new Promise((resolve, reject) => {
    const selectQuery = `
      SELECT r.*, rest.name as restaurant_name 
      FROM reservations r
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
    `
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
 * Retrieves a specific reservation by ID with restaurant information
 * @param {number} reservationId - ID of the reservation
 * @returns {Promise<Object>} Reservation object with restaurant name or undefined
 */
const getReservationById = (reservationId) => {
  return new Promise((resolve, reject) => {
    const selectQuery = `
      SELECT r.*, rest.name as restaurant_name 
      FROM reservations r
      LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
      WHERE r.id = ?
    `
    database.get(selectQuery, [reservationId], (error, row) => {
      if (error) {
        reject(error)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Retrieves all reservations for a specific restaurant
 * @param {number} restaurantId - ID of the restaurant
 * @returns {Promise<Array>} Array of reservations for the restaurant
 */
const getReservationsByRestaurantId = (restaurantId) => {
  return new Promise((resolve, reject) => {
    const selectQuery = `
      SELECT * FROM reservations 
      WHERE restaurant_id = ?
    `
    database.all(selectQuery, [restaurantId], (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows || [])
      }
    })
  })
}

/**
 * Updates an existing reservation
 * @param {number} reservationId - ID of the reservation to update
 * @param {Object} reservationData - Updated reservation information
 * @returns {Promise<Object>} Updated reservation object
 */
const updateReservation = (reservationId, reservationData) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE reservations 
      SET customer_name = ?, number_of_people = ?, reservation_date = ?, 
          reservation_time = ?, status = ?
      WHERE id = ?
    `
    const queryParameters = [
      reservationData.customer_name,
      reservationData.number_of_people,
      reservationData.reservation_date,
      reservationData.reservation_time,
      reservationData.status,
      reservationId
    ]

    database.run(updateQuery, queryParameters, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ id: reservationId, ...reservationData })
      }
    })
  })
}

/**
 * Deletes a reservation from the database
 * @param {number} reservationId - ID of the reservation to delete
 * @returns {Promise<Object>} Result object with number of deleted rows
 */
const deleteReservation = (reservationId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = 'DELETE FROM reservations WHERE id = ?'
    database.run(deleteQuery, [reservationId], function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ deletedCount: this.changes })
      }
    })
  })
}

/**
 * Cancels a reservation by updating its status to 'cancelled'
 * @param {number} reservationId - ID of the reservation to cancel
 * @returns {Promise<Object>} Updated reservation with cancelled status
 */
const cancelReservation = (reservationId) => {
  return new Promise((resolve, reject) => {
    const updateQuery = 'UPDATE reservations SET status = ? WHERE id = ?'
    database.run(updateQuery, [RESERVATION_STATUS_CANCELLED, reservationId], function (error) {
      if (error) {
        reject(error)
      } else {
        resolve({ id: reservationId, status: RESERVATION_STATUS_CANCELLED })
      }
    })
  })
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByRestaurantId,
  updateReservation,
  deleteReservation,
  cancelReservation
}
