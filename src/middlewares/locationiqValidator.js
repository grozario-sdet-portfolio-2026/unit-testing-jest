const { sendValidationError } = require('../utils/responseHandler')

/**
 * Validates coordinates are within acceptable geographic ranges
 * @param {number} latitude - Latitude value (-90 to 90)
 * @param {number} longitude - Longitude value (-180 to 180)
 * @throws {Error} If coordinates are invalid
 */
const validateCoordinates = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Latitude and longitude must be numbers')
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90')
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180')
  }
}

/**
 * Validates search radius is positive
 * @param {number} radiusMeters - Radius in meters
 * @throws {Error} If radius is invalid
 */
const validateSearchRadius = (radiusMeters) => {
  if (typeof radiusMeters !== 'number' || radiusMeters < 1) {
    throw new Error('Radius must be a positive number greater than 0 meters')
  }
}

/**
 * Internal validator function for nearby search parameters
 * Available for direct testing and component usage
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radiusMeters - Search radius in meters
 * @param {string} amenity - Type of amenity to search
 * @throws {Error} If validation fails
 */
const validateNearbySearchParams = (latitude, longitude, radiusMeters, amenity) => {
  validateCoordinates(latitude, longitude)
  validateSearchRadius(radiusMeters)

  if (!amenity || typeof amenity !== 'string') {
    throw new Error('Amenity must be a non-empty string')
  }
}

const validateNearbySearchParamsMiddleware = (req, res, next) => {
  try {
    const { latitude, longitude, radius = 1000, amenity = 'restaurant' } = req.query

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required query parameters')
    }

    const latitude_num = parseFloat(latitude)
    const longitude_num = parseFloat(longitude)
    const radius_meters = parseInt(radius)

    validateNearbySearchParams(latitude_num, longitude_num, radius_meters, amenity)
    next()
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

/**
 * Validates address string is valid
 * @param {string} address - Address to validate
 * @throws {Error} If address is invalid
 */
const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    throw new Error('Address must be a non-empty string')
  }

  if (address.trim().length === 0) {
    throw new Error('Address cannot be empty or whitespace only')
  }
}

module.exports = {
  validateCoordinates,
  validateSearchRadius,
  validateNearbySearchParams,
  validateNearbySearchParamsMiddleware,
  validateAddress
}
