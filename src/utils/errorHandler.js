const { sendError } = require('./responseHandler')
const logger = require('./logger')

class ApplicationError extends Error {
  constructor (message, statusCode, details = null) {
    super(message)
    this.name = 'ApplicationError'
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Wraps async route handlers to catch errors and send appropriate responses
 * @param {Function} handler - Async request handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      logger.error(
        `Unhandled error in route handler: ${req.method} ${req.path}`,
        error
      )
      handleRouteError(error, res, req)
    })
  }
}

const handleRouteError = (error, res, req = null) => {
  const errorMessage = error.message || 'Unknown error occurred'
  const requestContext = req ? `${req.method} ${req.path}` : 'unknown endpoint'

  if (error instanceof ApplicationError) {
    logger.warn(`Expected error caught: ${error.message}`, {
      context: requestContext
    })
    return sendError(res, error.statusCode, error.name, error.message)
  }

  if (
    errorMessage.includes('Latitude') ||
    errorMessage.includes('Longitude') ||
    errorMessage.includes('Capacity') ||
    errorMessage.includes('Radius') ||
    errorMessage.includes('required field') ||
    errorMessage.toLowerCase().includes('validation') ||
    errorMessage.toLowerCase().includes('invalid')
  ) {
    logger.warn(`Validation error: ${errorMessage}`, {
      context: requestContext
    })
    return sendError(res, 400, 'Validation Error', errorMessage)
  }

  if (
    errorMessage.includes('LocationIQ API') ||
    errorMessage.includes('External Service') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('timeout')
  ) {
    logger.error(`External service error: ${errorMessage}`, {
      context: requestContext
    })
    return sendError(
      res,
      502,
      'External Service Error',
      'Unable to reach external service. Please try again later.'
    )
  }

  if (
    errorMessage.includes('database') ||
    errorMessage.includes('query') ||
    errorMessage.includes('sqlite') ||
    error.name === 'DatabaseError'
  ) {
    logger.error(`Database error: ${errorMessage}`, {
      context: requestContext
    })
    return sendError(
      res,
      500,
      'Database Error',
      'An error occurred while accessing the database. Please try again later.'
    )
  }

  if (error instanceof SyntaxError) {
    logger.warn(`Parse error: ${errorMessage}`, { context: requestContext })
    return sendError(res, 400, 'Parse Error', 'Invalid request format.')
  }

  logger.error(`Unexpected error: ${errorMessage}`, error)
  const userMessage =
    process.env.NODE_ENV === 'development'
      ? errorMessage
      : 'An unexpected error occurred. Please try again later.'
  return sendError(res, 500, 'Server Error', userMessage)
}

/**
 * Global error handler middleware for Express
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
/**
 * Handles errors from external API calls
 * @param {Error} error - The error from axios
 * @param {string} operation - Name of operation that failed
 * @param {Object} config - Configuration object with API details
 * @param {number} config.timeout - API timeout in milliseconds
 * @throws {Error} Re-throws a sanitized error
 */
const handleExternalApiError = (error, operation, config = {}) => {
  const { timeout = 5000 } = config

  if (!error.response) {
    if (error.code === 'ECONNREFUSED') {
      logger.error(`External API service unreachable (${operation})`, {
        code: error.code,
        message: 'Connection refused'
      })
      throw new Error('External API service is currently unavailable')
    }

    if (error.code === 'ENOTFOUND') {
      logger.error(`External API DNS resolution failed (${operation})`, {
        code: error.code,
        message: 'DNS lookup failed'
      })
      throw new Error('External API service could not be reached')
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.message === 'timeout of ' + timeout + 'ms exceeded'
    ) {
      logger.warn(`External API timeout (${operation})`, {
        timeout
      })
      throw new Error('External API request timed out')
    }

    logger.error(`External API network error (${operation})`, {
      code: error.code,
      message: error.message
    })
    throw new Error('Unable to reach external API service')
  }

  const statusCode = error.response.status
  const responseData = error.response.data

  if (statusCode === 401 || statusCode === 403) {
    logger.error(
      `External API authentication/authorization failed (${operation})`,
      {
        status: statusCode,
        message: 'Invalid API key or insufficient permissions'
      }
    )
    throw new Error('External API authentication failed')
  }

  if (statusCode === 429) {
    logger.warn(`External API rate limit exceeded (${operation})`, {
      status: statusCode
    })
    throw new Error(
      'External API rate limit exceeded. Please try again later.'
    )
  }

  if (statusCode === 400) {
    const message = responseData?.error || 'Invalid request parameters'
    logger.warn(`External API bad request (${operation})`, {
      status: statusCode,
      message
    })
    throw new Error(`External API rejected request: ${message}`)
  }

  if (statusCode >= 500) {
    logger.error(`External API service error (${operation})`, {
      status: statusCode,
      message: responseData?.error || 'Server error'
    })
    throw new Error('External API service error. Please try again later.')
  }

  logger.error(`External API error (${operation})`, {
    status: statusCode,
    message: error.message
  })
  throw new Error(`External API error: ${statusCode}`)
}

/**
 * Global error handler middleware for Express
 * Catches any errors that escaped normal flow
 * Should be used as the last middleware
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (error, req, res, next) => {
  logger.error(
    `Global error handler caught unhandled error: ${error.message}`,
    error
  )

  if (res.headersSent) {
    return next(error)
  }

  handleRouteError(error, res, req)
}

module.exports = {
  asyncHandler,
  handleRouteError,
  globalErrorHandler,
  ApplicationError,
  handleExternalApiError
}
