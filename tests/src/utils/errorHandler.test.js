const errorHandler = require('../../../src/utils/errorHandler')
const responseHandler = require('../../../src/utils/responseHandler')
const logger = require('../../../src/utils/logger')

jest.mock('../../../src/utils/responseHandler')
jest.mock('../../../src/utils/logger')

describe('Error Handler', () => {
  let res, req, next

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnValue({
        json: jest.fn()
      }),
      json: jest.fn(),
      headersSent: false
    }

    req = {
      method: 'GET',
      path: '/api/test'
    }

    next = jest.fn()

    jest.clearAllMocks()
  })

  describe('ApplicationError', () => {
    describe('constructor', () => {
      it('should create an ApplicationError with message and status code', () => {
        const message = 'Test error'
        const statusCode = 400

        const error = new errorHandler.ApplicationError(message, statusCode)

        expect(error.name).toBe('ApplicationError')
        expect(error.message).toBe(message)
        expect(error.statusCode).toBe(statusCode)
        expect(error.details).toBeNull()
      })

      it('should create an ApplicationError with details', () => {
        const message = 'Test error'
        const statusCode = 400
        const details = { field: 'email', value: 'invalid' }

        const error = new errorHandler.ApplicationError(
          message,
          statusCode,
          details
        )

        expect(error.message).toBe(message)
        expect(error.statusCode).toBe(statusCode)
        expect(error.details).toEqual(details)
      })

      test.each([
        { statusCode: 400, message: 'Bad Request' },
        { statusCode: 401, message: 'Unauthorized' },
        { statusCode: 403, message: 'Forbidden' },
        { statusCode: 404, message: 'Not Found' },
        { statusCode: 500, message: 'Server Error' }
      ])(
        'should create error with status $statusCode',
        ({ statusCode, message }) => {
          const error = new errorHandler.ApplicationError(message, statusCode)

          expect(error.statusCode).toBe(statusCode)
          expect(error instanceof Error).toBe(true)
        }
      )
    })
  })

  describe('asyncHandler', () => {
    it('should wrap async handler and catch errors', async () => {
      const error = new Error('Async handler error')
      const handler = jest.fn().mockRejectedValue(error)

      const wrappedHandler = errorHandler.asyncHandler(handler)

      await wrappedHandler(req, res, next)

      expect(handler).toHaveBeenCalledWith(req, res, next)
      expect(logger.error).toHaveBeenCalled()
      expect(responseHandler.sendError).toHaveBeenCalled()
    })

    it('should execute handler successfully when no error occurs', async () => {
      const handler = jest.fn().mockResolvedValue(undefined)

      const wrappedHandler = errorHandler.asyncHandler(handler)

      await wrappedHandler(req, res, next)

      expect(handler).toHaveBeenCalledWith(req, res, next)
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('should handle handler with mixed async/sync operations that reject', async () => {
      const error = new Error('Async handler error')
      const handler = jest.fn().mockImplementation(async () => {
        throw error
      })

      const wrappedHandler = errorHandler.asyncHandler(handler)

      await wrappedHandler(req, res, next)

      expect(handler).toHaveBeenCalledWith(req, res, next)
      expect(logger.error).toHaveBeenCalled()
      expect(responseHandler.sendError).toHaveBeenCalled()
    })
  })

  describe('handleRouteError', () => {
    describe('ApplicationError handling', () => {
      it('should handle ApplicationError with appropriate status code', () => {
        const appError = new errorHandler.ApplicationError(
          'Resource not found',
          404,
          null
        )

        errorHandler.handleRouteError(appError, res, req)

        expect(logger.warn).toHaveBeenCalled()
        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          404,
          'ApplicationError',
          'Resource not found'
        )
      })

      it('should handle ApplicationError with details', () => {
        const details = { field: 'email' }
        const appError = new errorHandler.ApplicationError(
          'Validation failed',
          400,
          details
        )

        errorHandler.handleRouteError(appError, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          400,
          'ApplicationError',
          'Validation failed'
        )
      })
    })

    describe('Validation error handling', () => {
      test.each([
        { errorMessage: 'Latitude must be between -90 and 90' },
        { errorMessage: 'Longitude must be between -180 and 180' },
        { errorMessage: 'Radius must be positive' },
        { errorMessage: 'Capacity is required field' },
        { errorMessage: 'Validation error: invalid email' },
        { errorMessage: 'Invalid input' }
      ])(
        'should handle validation error - $errorMessage',
        ({ errorMessage }) => {
          const error = new Error(errorMessage)

          errorHandler.handleRouteError(error, res, req)

          expect(responseHandler.sendError).toHaveBeenCalledWith(
            res,
            400,
            'Validation Error',
            errorMessage
          )
        }
      )
    })

    describe('External API error handling', () => {
      test.each([
        { errorMessage: 'LocationIQ API error' },
        { errorMessage: 'External Service unavailable' },
        { errorMessage: 'ECONNREFUSED' },
        { errorMessage: 'ENOTFOUND' },
        { errorMessage: 'timeout occurred' }
      ])(
        'should handle external API error - $errorMessage',
        ({ errorMessage }) => {
          const error = new Error(errorMessage)

          errorHandler.handleRouteError(error, res, req)

          expect(responseHandler.sendError).toHaveBeenCalledWith(
            res,
            502,
            'External Service Error',
            expect.any(String)
          )
          expect(logger.error).toHaveBeenCalled()
        }
      )
    })

    describe('Database error handling', () => {
      test.each([
        { errorMessage: 'database connection failed' },
        { errorMessage: 'SQL query error' },
        { errorMessage: 'sqlite error' }
      ])(
        'should handle database error - $errorMessage',
        ({ errorMessage }) => {
          const error = new Error(errorMessage)

          errorHandler.handleRouteError(error, res, req)

          expect(responseHandler.sendError).toHaveBeenCalledWith(
            res,
            500,
            'Database Error',
            expect.any(String)
          )
          expect(logger.error).toHaveBeenCalled()
        }
      )

      it('should handle DatabaseError by name', () => {
        const error = new Error('Query failed')
        error.name = 'DatabaseError'

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          500,
          'Database Error',
          expect.any(String)
        )
      })
    })

    describe('Syntax/Parse error handling', () => {
      it('should handle SyntaxError', () => {
        const error = new SyntaxError('Unexpected token')

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          400,
          'Parse Error',
          'Invalid request format.'
        )
      })
    })

    describe('Unexpected error handling', () => {
      it('should handle unexpected error with generic message in production', () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'

        const error = new Error('Unexpected error')

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          500,
          'Server Error',
          'An unexpected error occurred. Please try again later.'
        )

        process.env.NODE_ENV = originalEnv
      })

      it('should handle unexpected error with error message in development', () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'development'

        const error = new Error('Development error details')

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          500,
          'Server Error',
          'Development error details'
        )

        process.env.NODE_ENV = originalEnv
      })

      it('should handle error with undefined message', () => {
        const error = new Error()
        error.message = undefined

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          500,
          'Server Error',
          expect.any(String)
        )
        expect(logger.error).toHaveBeenCalled()
      })

      it('should use default message when error.message is undefined', () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'

        const error = new Error()
        error.message = undefined

        errorHandler.handleRouteError(error, res, req)

        expect(responseHandler.sendError).toHaveBeenCalledWith(
          res,
          500,
          'Server Error',
          'An unexpected error occurred. Please try again later.'
        )

        process.env.NODE_ENV = originalEnv
      })
    })

    describe('request context logging', () => {
      it('should log request context when req is provided', () => {
        const error = new Error('Test error')

        errorHandler.handleRouteError(error, res, req)

        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle error without request context', () => {
        const error = new Error('Test error')

        errorHandler.handleRouteError(error, res)

        expect(responseHandler.sendError).toHaveBeenCalled()
      })
    })
  })

  describe('handleExternalApiError', () => {
    describe('connection errors', () => {
      it('should handle ECONNREFUSED error', () => {
        const error = new Error('Connection refused')
        error.code = 'ECONNREFUSED'

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {
            timeout: 5000
          })
        }).toThrow('External API service is currently unavailable')

        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle ENOTFOUND error', () => {
        const error = new Error('getaddrinfo ENOTFOUND')
        error.code = 'ENOTFOUND'

        expect(() => {
          errorHandler.handleExternalApiError(error, 'geocode', {})
        }).toThrow('External API service could not be reached')

        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle timeout error', () => {
        const timeout = 5000
        const error = new Error(`timeout of ${timeout}ms exceeded`)
        error.code = 'ECONNABORTED'

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', { timeout })
        }).toThrow('External API request timed out')

        expect(logger.warn).toHaveBeenCalled()
      })

      it('should handle generic network error', () => {
        const error = new Error('Network error')
        error.code = 'ENETUNREACH'

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('Unable to reach external API service')

        expect(logger.error).toHaveBeenCalled()
      })
    })

    describe('HTTP response errors', () => {
      it('should handle 401 Unauthorized error', () => {
        const error = new Error('Unauthorized')
        error.response = {
          status: 401,
          data: { error: 'Invalid API key' }
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API authentication failed')

        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle 403 Forbidden error', () => {
        const error = new Error('Forbidden')
        error.response = {
          status: 403,
          data: { error: 'Insufficient permissions' }
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API authentication failed')
      })

      it('should handle 429 Rate Limit error', () => {
        const error = new Error('Too Many Requests')
        error.response = {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API rate limit exceeded. Please try again later.')

        expect(logger.warn).toHaveBeenCalled()
      })

      it('should handle 400 Bad Request error', () => {
        const error = new Error('Bad Request')
        error.response = {
          status: 400,
          data: { error: 'Invalid coordinates' }
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API rejected request: Invalid coordinates')

        expect(logger.warn).toHaveBeenCalled()
      })

      it('should handle 400 Bad Request without error details', () => {
        const error = new Error('Bad Request')
        error.response = {
          status: 400,
          data: {}
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API rejected request: Invalid request parameters')
      })

      test.each([
        { statusCode: 500, errorType: 'Internal Server Error' },
        { statusCode: 502, errorType: 'Bad Gateway' },
        { statusCode: 503, errorType: 'Service Unavailable' }
      ])(
        'should handle $statusCode server error',
        ({ statusCode, errorType }) => {
          const error = new Error(errorType)
          error.response = {
            status: statusCode,
            data: { error: errorType }
          }

          expect(() => {
            errorHandler.handleExternalApiError(error, 'search', {})
          }).toThrow(
            'External API service error. Please try again later.'
          )

          expect(logger.error).toHaveBeenCalled()
        }
      )

      it('should handle server error without error details (responseData.error undefined)', () => {
        const error = new Error('Internal Server Error')
        error.response = {
          status: 500,
          data: {}
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API service error. Please try again later.')

        expect(logger.error).toHaveBeenCalled()
      })

      it('should handle generic HTTP error', () => {
        const error = new Error('Conflict')
        error.response = {
          status: 409,
          data: { error: 'Resource conflict' }
        }

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search', {})
        }).toThrow('External API error: 409')

        expect(logger.error).toHaveBeenCalled()
      })
    })

    describe('default timeout handling', () => {
      it('should use default timeout of 5000ms when not provided', () => {
        const error = new Error('timeout of 5000ms exceeded')
        error.code = 'ECONNABORTED'

        expect(() => {
          errorHandler.handleExternalApiError(error, 'search')
        }).toThrow('External API request timed out')
      })
    })
  })

  describe('globalErrorHandler', () => {
    it('should call handleRouteError for unhandled errors', () => {
      const error = new Error('Unhandled error')

      errorHandler.globalErrorHandler(error, req, res, next)

      expect(logger.error).toHaveBeenCalled()
      expect(responseHandler.sendError).toHaveBeenCalled()
    })

    it('should not send response if headers already sent', () => {
      res.headersSent = true
      const error = new Error('Error after response sent')

      errorHandler.globalErrorHandler(error, req, res, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(responseHandler.sendError).not.toHaveBeenCalled()
    })

    it('should pass error to next middleware if headers sent', () => {
      res.headersSent = true
      const error = new Error('Error')

      errorHandler.globalErrorHandler(error, req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should log global error handler message', () => {
      const error = new Error('Global error')

      errorHandler.globalErrorHandler(error, req, res, next)

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Global error handler caught'),
        error
      )
    })
  })
})
