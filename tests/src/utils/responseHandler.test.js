const responseHandler = require('../../../src/utils/responseHandler')
const logger = require('../../../src/utils/logger')

jest.mock('../../../src/utils/logger')

describe('Response Handler', () => {
  let res

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnValue({
        json: jest.fn()
      }),
      json: jest.fn()
    }

    jest.clearAllMocks()
  })

  describe('sendSuccess', () => {
    describe('basic success responses', () => {
      it('should send success response with data and status code', () => {
        const data = { id: 1, name: 'Test' }
        const statusCode = 200

        responseHandler.sendSuccess(res, statusCode, data)

        expect(res.status).toHaveBeenCalledWith(statusCode)
        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data
        })
      })

      it('should include message when provided', () => {
        const data = { id: 1, name: 'Created' }
        const statusCode = 201
        const message = 'Resource created successfully'

        responseHandler.sendSuccess(res, statusCode, data, message)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data,
          message
        })
      })

      it('should not include message when not provided', () => {
        const data = { id: 1 }
        const statusCode = 200

        responseHandler.sendSuccess(res, statusCode, data)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data
        })
      })

      it('should not include message when message is null', () => {
        const data = { id: 1 }

        responseHandler.sendSuccess(res, 200, data, null)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data
        })
      })
    })

    describe('array data handling', () => {
      it('should include count when data is an array', () => {
        const data = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' }
        ]
        const statusCode = 200

        responseHandler.sendSuccess(res, statusCode, data)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data,
          count: 3
        })
      })

      it('should include empty array with count 0', () => {
        const data = []

        responseHandler.sendSuccess(res, 200, data)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data,
          count: 0
        })
      })

      it('should include count and message for array with message', () => {
        const data = [{ id: 1 }, { id: 2 }]
        const message = 'Items retrieved'

        responseHandler.sendSuccess(res, 200, data, message)

        expect(res.status().json).toHaveBeenCalledWith({
          success: true,
          data,
          count: 2,
          message
        })
      })
    })

    describe('different status codes', () => {
      test.each([
        { statusCode: 200, description: 'OK' },
        { statusCode: 201, description: 'Created' },
        { statusCode: 204, description: 'No Content' }
      ])(
        'should send success with status code $statusCode ($description)',
        ({ statusCode }) => {
          const data = { id: 1 }

          responseHandler.sendSuccess(res, statusCode, data)

          expect(res.status).toHaveBeenCalledWith(statusCode)
          expect(res.status().json).toHaveBeenCalled()
        }
      )
    })

    describe('data types', () => {
      test.each([
        { data: { id: 1, name: 'Object' }, type: 'object' },
        { data: null, type: 'null' },
        { data: '', type: 'empty string' },
        { data: 0, type: 'number zero' },
        { data: false, type: 'boolean false' }
      ])(
        'should handle $type data',
        ({ data }) => {
          responseHandler.sendSuccess(res, 200, data)

          expect(res.status).toHaveBeenCalledWith(200)
          expect(res.status().json).toHaveBeenCalled()
        }
      )
    })
  })

  describe('sendError', () => {
    describe('basic error responses', () => {
      it('should send error response with error title and status code', () => {
        const statusCode = 404
        const error = 'Not Found'

        responseHandler.sendError(res, statusCode, error)

        expect(res.status).toHaveBeenCalledWith(statusCode)
        expect(logger.warn).toHaveBeenCalled()
        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error
        })
      })

      it('should include message when details is a string', () => {
        const statusCode = 400
        const error = 'Validation Error'
        const details = 'Invalid email format'

        responseHandler.sendError(res, statusCode, error, details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error,
          message: details
        })
      })
    })

    describe('error logging', () => {
      it('should log error with message and context', () => {
        const statusCode = 500
        const error = 'Server Error'
        const details = 'Database connection failed'
        const logContext = { userId: 123 }

        responseHandler.sendError(res, statusCode, error, details, logContext)

        expect(logger.warn).toHaveBeenCalledWith(
          `API Error (${statusCode}): ${error}`,
          {
            message: details,
            context: logContext
          }
        )
      })

      it('should log error without context when not provided', () => {
        const error = 'Test Error'

        responseHandler.sendError(res, 400, error)

        expect(logger.warn).toHaveBeenCalledWith(
          expect.stringContaining('API Error'),
          {
            message: null,
            context: null
          }
        )
      })
    })

    describe('sensitive data redaction', () => {
      it('should exclude sensitive keys from details object', () => {
        const details = {
          apiKey: 'secret_key_123',
          action: 'login',
          token: 'token_xyz',
          userId: 1
        }

        responseHandler.sendError(res, 400, 'Error', details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Error',
          details: {
            action: 'login',
            userId: 1
          }
        })
      })

      test.each([
        { key: 'apiKey', value: 'secret' },
        { key: 'API_KEY', value: 'secret' },
        { key: 'token', value: 'xyz123' },
        { key: 'TOKEN', value: 'abc' },
        { key: 'password', value: 'pass123' },
        { key: 'PASSWORD', value: 'pwd' },
        { key: 'secret', value: 'data' },
        { key: 'SECRET', value: 'data' }
      ])(
        'should redact sensitive key - $key',
        ({ key, value }) => {
          const details = {
            [key]: value,
            safe: 'public'
          }

          responseHandler.sendError(res, 400, 'Error', details)

          const response = res.status().json.mock.calls[0][0]
          expect(response.details).not.toHaveProperty(key)
          expect(response.details).toHaveProperty('safe', 'public')
        }
      )
    })

    describe('details handling', () => {
      it('should not include details when details is null', () => {
        responseHandler.sendError(res, 400, 'Error', null)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Error'
        })
      })

      it('should include empty details object when all keys are sensitive', () => {
        const details = {
          apiKey: 'secret',
          token: 'secret'
        }

        responseHandler.sendError(res, 400, 'Error', details)

        const response = res.status().json.mock.calls[0][0]
        expect(response).not.toHaveProperty('details')
      })

      it('should include mixed details object with safe and sensitive keys', () => {
        const details = {
          model: 'database',
          password: 'secret123',
          version: '1.0',
          apiKey: 'key123',
          userId: 5
        }

        responseHandler.sendError(res, 400, 'Error', details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Error',
          details: {
            model: 'database',
            version: '1.0',
            userId: 5
          }
        })
      })
    })

    describe('different error types', () => {
      test.each([
        { statusCode: 400, error: 'Bad Request' },
        { statusCode: 401, error: 'Unauthorized' },
        { statusCode: 403, error: 'Forbidden' },
        { statusCode: 404, error: 'Not Found' },
        { statusCode: 500, error: 'Internal Server Error' },
        { statusCode: 502, error: 'Bad Gateway' },
        { statusCode: 503, error: 'Service Unavailable' }
      ])(
        'should send $statusCode error - $error',
        ({ statusCode, error }) => {
          responseHandler.sendError(res, statusCode, error)

          expect(res.status).toHaveBeenCalledWith(statusCode)
          expect(res.status().json).toHaveBeenCalledWith({
            success: false,
            error
          })
        }
      )
    })
  })

  describe('sendValidationError', () => {
    describe('basic validation error responses', () => {
      it('should send validation error with message', () => {
        const message = 'Email is required'

        responseHandler.sendValidationError(res, message)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })

      it('should always return 400 status code', () => {
        responseHandler.sendValidationError(res, 'Validation failed')

        expect(res.status).toHaveBeenCalledWith(400)
      })
    })

    describe('validation logging', () => {
      it('should log validation error with details', () => {
        const message = 'Invalid input'
        const details = { field: 'email', reason: 'invalid format' }

        responseHandler.sendValidationError(res, message, details)

        expect(logger.debug).toHaveBeenCalledWith(
          `Validation error: ${message}`,
          { details }
        )
      })

      it('should log without details when not provided', () => {
        responseHandler.sendValidationError(res, 'Validation failed')

        expect(logger.debug).toHaveBeenCalledWith(
          expect.stringContaining('Validation error'),
          { details: null }
        )
      })
    })

    describe('required fields array', () => {
      it('should include requiredFields when details is an array', () => {
        const message = 'Missing required fields'
        const requiredFields = ['email', 'password', 'name']

        responseHandler.sendValidationError(res, message, requiredFields)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message,
          requiredFields
        })
      })

      it('should handle empty required fields array', () => {
        const message = 'Missing fields'
        const requiredFields = []

        responseHandler.sendValidationError(res, message, requiredFields)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message,
          requiredFields
        })
      })
    })

    describe('details object', () => {
      it('should include details object when details is an object', () => {
        const message = 'Validation failed'
        const details = {
          email: 'Invalid email format',
          age: 'Must be a number'
        }

        responseHandler.sendValidationError(res, message, details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message,
          details
        })
      })

      it('should handle empty details object', () => {
        responseHandler.sendValidationError(res, 'Validation error', {})

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message: 'Validation error',
          details: {}
        })
      })
    })

    describe('no details handling', () => {
      it('should not include details when details is null', () => {
        const message = 'Validation failed'

        responseHandler.sendValidationError(res, message, null)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })

      it('should not include details when details is undefined', () => {
        const message = 'Validation failed'

        responseHandler.sendValidationError(res, message, undefined)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })

      it('should handle primitive details value (number)', () => {
        const message = 'Validation error'
        const details = 123

        responseHandler.sendValidationError(res, message, details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })

      it('should handle primitive details value (string)', () => {
        const message = 'Validation error'
        const details = 'error details'

        responseHandler.sendValidationError(res, message, details)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })

      it('should handle boolean true as details', () => {
        const message = 'Validation error'

        responseHandler.sendValidationError(res, message, true)

        expect(res.status().json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation Error',
          message
        })
      })
    })

    describe('validation messages', () => {
      test.each([
        { message: 'Email is required' },
        { message: 'Password must be at least 8 characters' },
        { message: 'Invalid phone number format' },
        { message: 'Name cannot be empty' }
      ])(
        'should handle validation message - $message',
        ({ message }) => {
          responseHandler.sendValidationError(res, message)

          expect(res.status().json).toHaveBeenCalledWith(
            expect.objectContaining({
              message,
              error: 'Validation Error'
            })
          )
        }
      )
    })
  })

  describe('response consistency', () => {
    it('sendSuccess should always include success: true', () => {
      responseHandler.sendSuccess(res, 200, {})

      const response = res.status().json.mock.calls[0][0]
      expect(response.success).toBe(true)
    })

    it('sendError should always include success: false', () => {
      responseHandler.sendError(res, 400, 'Error')

      const response = res.status().json.mock.calls[0][0]
      expect(response.success).toBe(false)
    })

    it('sendValidationError should always include success: false and error: Validation Error', () => {
      responseHandler.sendValidationError(res, 'Field required')

      const response = res.status().json.mock.calls[0][0]
      expect(response.success).toBe(false)
      expect(response.error).toBe('Validation Error')
    })
  })
})
