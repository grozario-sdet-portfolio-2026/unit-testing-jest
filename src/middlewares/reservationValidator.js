const { sendValidationError } = require('../utils/responseHandler')

/**
 * DRY Helper: Generic middleware factory for validation functions
 * @param {Function} validatorFn - Validator function to wrap
 * @returns {Function} Express middleware function
 */
const createValidatorMiddleware = (validatorFn) => {
  return (req, res, next) => {
    try {
      validatorFn(req.body)
      next()
    } catch (error) {
      return sendValidationError(res, error.message)
    }
  }
}

/**
 * Internal validator function for creating a reservation
 * @param {Object} reservationData - Reservation data to validate
 * @throws {Error} If validation fails
 */
const validateCreateReservation = (reservationData) => {
  const { restaurant_id, customer_name, number_of_people, reservation_date, reservation_time } = reservationData

  if (!restaurant_id || !customer_name || !number_of_people || !reservation_date || !reservation_time) {
    throw new Error('Missing required fields: restaurant_id, customer_name, number_of_people, reservation_date, reservation_time')
  }

  validateNumberOfPeople(number_of_people)
  validateReservationDateTime(reservation_date, reservation_time)
}

const validateCreateReservationMiddleware = createValidatorMiddleware(validateCreateReservation)

/**
 * Validates number of people is a positive number
 * @param {number} numberOfPeople - Number of people in the reservation
 * @throws {Error} If validation fails
 */
const validateNumberOfPeople = (numberOfPeople) => {
  if (typeof numberOfPeople !== 'number' || numberOfPeople <= 0) {
    throw new Error('Number of people must be a positive number')
  }
}

/**
 * Validates reservation date and time are in the future
 * @param {string} reservationDate - Date in YYYY-MM-DD format
 * @param {string} reservationTime - Time in HH:mm format
 * @throws {Error} If validation fails
 */
const validateReservationDateTime = (reservationDate, reservationTime) => {
  try {
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`)

    if (isNaN(reservationDateTime.getTime())) {
      throw new Error('Invalid reservation date or time format')
    }

    const now = new Date()

    if (reservationDateTime <= now) {
      throw new Error('Reservation date and time must be in the future')
    }
  } catch (error) {
    throw error
  }
}

/**
 * Validates that reservation group size does not exceed capacity
 * @param {number} numberOfPeople - Number of people in the reservation
 * @param {number} restaurantCapacity - Restaurant's maximum capacity
 * @throws {Error} If group size exceeds capacity
 */
const validateGroupSizeAgainstCapacity = (numberOfPeople, restaurantCapacity) => {
  if (numberOfPeople > restaurantCapacity) {
    throw new Error(`Number of people (${numberOfPeople}) exceeds restaurant capacity (${restaurantCapacity})`)
  }
}

/**
 * Internal validator function for updating a reservation
 * @param {Object} updateData - Fields to update
 * @throws {Error} If validation fails
 */
const validateUpdateReservation = (updateData) => {
  if (updateData.number_of_people !== undefined) {
    validateNumberOfPeople(updateData.number_of_people)
  }

  if (updateData.reservation_date !== undefined || updateData.reservation_time !== undefined) {
    if (updateData.reservation_date && updateData.reservation_time) {
      validateReservationDateTime(updateData.reservation_date, updateData.reservation_time)
    }
  }
}

/**
 * Express middleware wrapper for validating update reservation requests
 * DRY: Uses factory to eliminate middleware boilerplate
 */
const validateUpdateReservationMiddleware = createValidatorMiddleware(validateUpdateReservation)

module.exports = {
  validateCreateReservation,
  validateCreateReservationMiddleware,
  validateNumberOfPeople,
  validateReservationDateTime,
  validateGroupSizeAgainstCapacity,
  validateUpdateReservation,
  validateUpdateReservationMiddleware
}
