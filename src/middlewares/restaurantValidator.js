const { sendValidationError } = require('../utils/responseHandler')
const { validateNumberInRange } = require('../utils/validators')

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
 * Internal validator function for creating a restaurant
 * @param {Object} restaurantData - Restaurant data to validate
 * @throws {Error} If validation fails
 */
const validateCreateRestaurant = (restaurantData) => {
  const { name, address, capacity } = restaurantData

  if (!name || !address || capacity === undefined) {
    throw new Error('Missing required fields: name, address, capacity')
  }

  validateCapacity(capacity)

  if (restaurantData.latitude !== undefined && restaurantData.latitude !== null) {
    validateLatitude(restaurantData.latitude)
  }

  if (restaurantData.longitude !== undefined && restaurantData.longitude !== null) {
    validateLongitude(restaurantData.longitude)
  }
}

const validateCreateRestaurantMiddleware = createValidatorMiddleware(validateCreateRestaurant)

/**
 * Validates restaurant capacity is a positive number
 * @param {number} capacity - Restaurant capacity
 * @throws {Error} If capacity is invalid
 */
const validateCapacity = (capacity) => {
  validateNumberInRange(capacity, 1, Number.MAX_SAFE_INTEGER, 'Capacity')
}

/**
 * Validates latitude is within acceptable range (-90 to 90)
 * @param {number} latitude - Latitude value
 * @throws {Error} If latitude is invalid
 */
const validateLatitude = (latitude) => {
  validateNumberInRange(latitude, -90, 90, 'Latitude')
}

/**
 * Validates longitude is within acceptable range (-180 to 180)
 * @param {number} longitude - Longitude value
 * @throws {Error} If longitude is invalid
 */
const validateLongitude = (longitude) => {
  validateNumberInRange(longitude, -180, 180, 'Longitude')
}

/**
 * Validates all fields provided for updating a restaurant
 * @param {Object} updateData - Fields to update
 * @throws {Error} If validation fails
 */
const validateUpdateRestaurant = (updateData) => {
  if (updateData.capacity !== undefined) {
    validateCapacity(updateData.capacity)
  }

  if (updateData.latitude !== undefined && updateData.latitude !== null) {
    validateLatitude(updateData.latitude)
  }

  if (updateData.longitude !== undefined && updateData.longitude !== null) {
    validateLongitude(updateData.longitude)
  }
}

const validateUpdateRestaurantMiddleware = createValidatorMiddleware(validateUpdateRestaurant)

module.exports = {
  validateCreateRestaurant,
  validateCreateRestaurantMiddleware,
  validateCapacity,
  validateLatitude,
  validateLongitude,
  validateUpdateRestaurant,
  validateUpdateRestaurantMiddleware
}
