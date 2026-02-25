const logger = require('./logger')

/**
 * Sends a successful response with data
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 * @returns {void}
 */
const sendSuccess = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
    data
  }

  if (message) {
    response.message = message
  }

  if (Array.isArray(data)) {
    response.count = data.length
  }

  return res.status(statusCode).json(response)
}

/**
 * Sends an error response with consistent formatting
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error title/description
 * @param {string|Object} details - Optional error details or message
 * @param {Object} logContext - Optional context for logging (not sent to client)
 * @returns {void}
 */
const sendError = (res, statusCode, error, details = null, logContext = null) => {
  // Log error for diagnosis purposes (only admin sees this)
  logger.warn(`API Error (${statusCode}): ${error}`, {
    message: details,
    context: logContext
  })

  const response = {
    success: false,
    error
  }

  // Include message in response if it's a string
  if (typeof details === 'string') {
    response.message = details
  } else if (typeof details === 'object' && details !== null) {
    // Only include non-sensitive details in response
    // Remove any details that might expose internals
    const safeDetails = {}
    Object.keys(details).forEach((key) => {
      const value = details[key]
      // Skip sensitive keys
      if (!key.toLowerCase().includes('key') &&
          !key.toLowerCase().includes('token') &&
          !key.toLowerCase().includes('password') &&
          !key.toLowerCase().includes('secret')) {
        safeDetails[key] = value
      }
    })

    if (Object.keys(safeDetails).length > 0) {
      response.details = safeDetails
    }
  }

  return res.status(statusCode).json(response)
}

/**
 * Sends validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message describing what failed validation
 * @param {Array<string>|Object} details - Required fields or validation details
 * @returns {void}
 */
const sendValidationError = (res, message, details = null) => {
  // Log validation errors for monitoring
  logger.debug(`Validation error: ${message}`, { details })

  const response = {
    success: false,
    error: 'Validation Error',
    message
  }

  if (details) {
    if (Array.isArray(details)) {
      response.requiredFields = details
    } else if (typeof details === 'object') {
      response.details = details
    }
  }

  return res.status(400).json(response)
}

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
}
