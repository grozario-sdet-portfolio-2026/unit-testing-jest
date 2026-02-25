const {
  createReservation: dbCreateReservation,
  getAllReservations: dbGetAllReservations,
  getReservationById: dbGetReservationById,
  getReservationsByRestaurantId: dbGetReservationsByRestaurantId,
  updateReservation: dbUpdateReservation,
  deleteReservation: dbDeleteReservation,
  cancelReservation: dbCancelReservation,
  getRestaurantById: dbGetRestaurantById
} = require('../infra/sqlite/database')
const {
  validateGroupSizeAgainstCapacity
} = require('../middlewares/reservationValidator')

/**
 * Retrieves all reservations
 * @returns {Promise<Array>} All reservations
 */
const getAllReservations = async () => {
  return dbGetAllReservations()
}

/**
 * Retrieves reservations for a specific restaurant
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Array>} Reservations for the restaurant
 */
const getReservationsByRestaurantId = async (restaurantId) => {
  return dbGetReservationsByRestaurantId(restaurantId)
}

/**
 * Retrieves a reservation by ID
 * @param {number} reservationId - Reservation ID
 * @returns {Promise<Object|null>} Reservation object or null if not found
 */
const getReservationById = async (reservationId) => {
  return dbGetReservationById(reservationId)
}

/**
 * Verifies if reservation exists, throws error if not
 * @param {number} reservationId - Reservation ID
 * @returns {Promise<Object>} Reservation object
 * @throws {Error} If reservation not found
 */
const getReservationByIdOrThrow = async (reservationId) => {
  const reservation = await dbGetReservationById(reservationId)
  if (!reservation) {
    throw new Error('Reservation not found')
  }
  return reservation
}

/**
 * Verifies if restaurant exists, throws error if not
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Restaurant object
 * @throws {Error} If restaurant not found
 */
const getRestaurantByIdOrThrow = async (restaurantId) => {
  const restaurant = await dbGetRestaurantById(restaurantId)
  if (!restaurant) {
    throw new Error('Restaurant not found')
  }
  return restaurant
}

/**
 * Merges updated fields with existing reservation data
 * @param {Object} existingReservation - Current reservation data
 * @param {Object} updateData - New data to merge
 * @returns {Object} Merged data
 */
const mergeReservationData = (existingReservation, updateData) => {
  const merged = { ...existingReservation }
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      merged[key] = updateData[key]
    }
  })
  return merged
}

/**
 * Creates a new reservation
 * Validates that restaurant exists and group size fits capacity
 * @param {Object} reservationData - Reservation information
 * @returns {Promise<Object>} Created reservation
 * @throws {Error} If restaurant not found or validation fails
 */
const createReservation = async (reservationData) => {
  const { restaurant_id, number_of_people } = reservationData
  const status = reservationData.status || 'confirmed'

  const restaurant = await getRestaurantByIdOrThrow(restaurant_id)

  validateGroupSizeAgainstCapacity(number_of_people, restaurant.capacity)

  return dbCreateReservation({
    ...reservationData,
    status
  })
}

/**
 * Updates a reservation
 * Validates capacity if number_of_people is being updated
 * @param {number} reservationId - Reservation ID
 * @param {Object} reservationData - Updated reservation data
 * @returns {Promise<Object>} Updated reservation
 * @throws {Error} If reservation or restaurant not found or validation fails
 */
const updateReservation = async (reservationId, reservationData) => {
  const existingReservation = await getReservationByIdOrThrow(reservationId)

  if (reservationData.number_of_people !== undefined) {
    const restaurant = await getRestaurantByIdOrThrow(existingReservation.restaurant_id)
    validateGroupSizeAgainstCapacity(reservationData.number_of_people, restaurant.capacity)
  }

  const mergedData = mergeReservationData(existingReservation, reservationData)
  return dbUpdateReservation(reservationId, mergedData)
}

/**
 * Deletes a reservation
 * @param {number} reservationId - Reservation ID
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If reservation not found
 */
const deleteReservation = async (reservationId) => {
  await getReservationByIdOrThrow(reservationId)
  return dbDeleteReservation(reservationId)
}

/**
 * Cancels a reservation (soft delete - changes status)
 * @param {number} reservationId - Reservation ID
 * @returns {Promise<Object>} Updated reservation
 * @throws {Error} If reservation not found
 */
const cancelReservation = async (reservationId) => {
  await getReservationByIdOrThrow(reservationId)
  return dbCancelReservation(reservationId)
}

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationByIdOrThrow,
  getReservationsByRestaurantId,
  mergeReservationData,
  updateReservation,
  deleteReservation,
  cancelReservation
}
