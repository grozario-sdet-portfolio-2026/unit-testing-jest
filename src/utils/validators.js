/**
 * DRY Helper: Validates a number is within a specified range
 * Reusable for latitude, longitude, and other bounded numeric values
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @param {string} fieldName - Field name for error messages
 * @throws {Error} If value is not a number or outside range
 */
const validateNumberInRange = (value, min, max, fieldName) => {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number`)
  }

  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`)
  }
}

/**
 * Validates that latitude and longitude are within valid ranges
 * @param {number} latitude - Latitude value (-90 to 90)
 * @param {number} longitude - Longitude value (-180 to 180)
 * @throws {Error} If coordinates are invalid
 */
const validateCoordinates = (latitude, longitude) => {
  validateNumberInRange(latitude, -90, 90, 'Latitude')
  validateNumberInRange(longitude, -180, 180, 'Longitude')
}

/**
 * Validates restaurant capacity is a positive number
 * @param {number} capacity - Restaurant capacity
 * @throws {Error} If capacity is invalid
 */
const validateCapacity = (capacity) => {
  validateNumberInRange(capacity, 1, Number.MAX_SAFE_INTEGER, 'Capacity')
}

/**
 * Validates latitude is within acceptable range
 * @param {number} latitude - Latitude value
 * @throws {Error} If latitude is invalid
 */
const validateLatitude = (latitude) => {
  if (latitude !== undefined && latitude !== null) {
    validateNumberInRange(latitude, -90, 90, 'Latitude')
  }
}

/**
 * Validates longitude is within acceptable range
 * @param {number} longitude - Longitude value
 * @throws {Error} If longitude is invalid
 */
const validateLongitude = (longitude) => {
  if (longitude !== undefined && longitude !== null) {
    validateNumberInRange(longitude, -180, 180, 'Longitude')
  }
}

/**
 * Validates search radius is positive
 * @param {number} radiusMeters - Radius in meters
 * @throws {Error} If radius is invalid
 */
const validateSearchRadius = (radiusMeters) => {
  if (radiusMeters < 1) {
    throw new Error('Radius must be greater than 0 meters')
  }
}

/**
 * Validates that required fields are present and not empty
 * @param {Object} data - Object containing fields to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @throws {Error} If any required field is missing
 */
const validateRequiredFields = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

module.exports = {
  validateNumberInRange,
  validateCoordinates,
  validateCapacity,
  validateLatitude,
  validateLongitude,
  validateSearchRadius,
  validateRequiredFields
}
