const { sendValidationError } = require('../utils/responseHandler')

/**
 * Validates that an ID is a positive number
 * @param {string|number} id - ID to validate
 * @throws {Error} If ID is invalid
 */
const validateIdFormat = (id) => {
  const idNum = parseInt(id)
  if (isNaN(idNum) || idNum <= 0) {
    throw new Error('ID must be a positive number')
  }
  return idNum
}

/**
 * DRY Helper: Generic resource ID middleware factory
 * @param {string} resourceName - Name of resource for error messages
 * @returns {Function} Express middleware function
 */
const createIdValidatorMiddleware = (resourceName) => {
  return (req, res, next) => {
    try {
      const { id } = req.params
      if (!id) {
        throw new Error(`${resourceName} ID is required`)
      }
      validateIdFormat(id)
      next()
    } catch (error) {
      return sendValidationError(res, error.message)
    }
  }
}

const validateRestaurantIdMiddleware = createIdValidatorMiddleware('Restaurant')

const validateReservationIdMiddleware = createIdValidatorMiddleware('Reservation')

/**
 * DRY Helper: Generic query parameter validator factory
 * @param {string} paramName - Name of parameter to validate
 * @returns {Function} Express middleware function
 */
const createOptionalIdFilterMiddleware = (paramName) => {
  return (req, res, next) => {
    try {
      const paramValue = req.query[paramName]

      if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
        const paramNum = parseInt(paramValue)
        if (isNaN(paramNum) || paramNum <= 0) {
          throw new Error(`${paramName} must be a positive number`)
        }
      }
      next()
    } catch (error) {
      return sendValidationError(res, error.message)
    }
  }
}

const validateReservationFiltersMiddleware = createOptionalIdFilterMiddleware('restaurant_id')

module.exports = {
  validateRestaurantIdMiddleware,
  validateReservationIdMiddleware,
  validateReservationFiltersMiddleware
}
