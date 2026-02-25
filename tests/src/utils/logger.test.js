const logger = require('../../../src/utils/logger')

describe('Logger Utility', () => {
  let consoleDebugSpy
  let consoleInfoSpy
  let consoleWarnSpy
  let consoleErrorSpy

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    jest.clearAllMocks()
  })

  afterEach(() => {
    consoleDebugSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('debug logging', () => {
    it('should log debug message in development environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Debug message')

      expect(consoleDebugSpy).toHaveBeenCalled()
      const output = consoleDebugSpy.mock.calls[0][0]
      expect(output).toContain('DEBUG')
      expect(output).toContain('Debug message')

      process.env.NODE_ENV = originalEnv
    })

    it('should not log debug message in production environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logger.debug('Debug message')

      expect(consoleDebugSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should include context when provided', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const context = { userId: 123, action: 'login' }
      logger.debug('User action', context)

      expect(consoleDebugSpy).toHaveBeenCalled()
      const output = consoleDebugSpy.mock.calls[0][0]
      expect(output).toContain(JSON.stringify(context))

      process.env.NODE_ENV = originalEnv
    })

    it('should include timestamp in output', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Debug message')

      expect(consoleDebugSpy).toHaveBeenCalled()
      const output = consoleDebugSpy.mock.calls[0][0]
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T/)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('info logging', () => {
    it('should log info message', () => {
      logger.info('Info message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('INFO')
      expect(output).toContain('Info message')
    })

    it('should log info message with string context', () => {
      logger.info('User action', 'User logged in')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('User logged in')
    })

    it('should log info message with object context', () => {
      const context = { action: 'created', resource: 'restaurant', id: 1 }
      logger.info('Restaurant created', context)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain(JSON.stringify(context))
    })

    it('should include LOG level in output', () => {
      logger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('[INFO]')
    })
  })

  describe('warn logging', () => {
    it('should log warn message', () => {
      logger.warn('Warning message')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const output = consoleWarnSpy.mock.calls[0][0]
      expect(output).toContain('WARN')
      expect(output).toContain('Warning message')
    })

    it('should log warn message with context', () => {
      const context = { status: 'deprecated', alternative: 'newFunction' }
      logger.warn('Feature is deprecated', context)

      expect(consoleWarnSpy).toHaveBeenCalled()
      const output = consoleWarnSpy.mock.calls[0][0]
      expect(output).toContain(JSON.stringify(context))
    })

    it('should use console.warn method', () => {
      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('error logging', () => {
    it('should log error message', () => {
      logger.error('Error message')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('ERROR')
      expect(output).toContain('Error message')
    })

    it('should log error message with string context', () => {
      logger.error('Database error', 'Connection timeout')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('Connection timeout')
    })

    it('should log error message with Error object context', () => {
      const error = new Error('Test error')
      logger.error('Caught exception', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('Error')
      expect(output).toContain('Test error')
    })

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('stack')

      process.env.NODE_ENV = originalEnv
    })

    it('should hide stack trace in production environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('[Stack trace hidden in production]')

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('sensitive data sanitization', () => {
    describe('API key redaction', () => {
      test.each([
        { message: 'API key is key: sk_live_123456789', expected: 'key: [REDACTED]' },
        { message: 'key=sk_test_987654321', expected: 'key: [REDACTED]' },
        { message: 'Invalid API key: abc123def456', expected: 'key: [REDACTED]' }
      ])(
        'should redact API key - $message',
        ({ message, expected }) => {
          logger.info(message)

          expect(consoleInfoSpy).toHaveBeenCalled()
          const output = consoleInfoSpy.mock.calls[0][0]
          expect(output).toContain(expected)
          expect(output).not.toContain('sk_live')
          expect(output).not.toContain('sk_test')
          expect(output).not.toContain('abc123def456')
        }
      )
    })

    describe('token redaction', () => {
      test.each([
        { message: 'Bearer token: eyJhbGciOiJIUzI1NiIs' },
        { message: 'token=abcdefg123456' },
        { message: 'refresh token: xyz789' }
      ])(
        'should redact token - $message',
        ({ message }) => {
          logger.info(message)

          expect(consoleInfoSpy).toHaveBeenCalled()
          const output = consoleInfoSpy.mock.calls[0][0]
          expect(output).toContain('[REDACTED]')
          expect(output).not.toContain('eyJhbGciOiJIUzI1NiIs')
          expect(output).not.toContain('abcdefg123456')
          expect(output).not.toContain('xyz789')
        }
      )
    })

    describe('password redaction', () => {
      test.each([
        { message: 'User password: secret123pass' },
        { message: 'password=myP@ssw0rd' }
      ])(
        'should redact password - $message',
        ({ message }) => {
          logger.warn(message)

          expect(consoleWarnSpy).toHaveBeenCalled()
          const output = consoleWarnSpy.mock.calls[0][0]
          expect(output).toContain('[REDACTED]')
          expect(output).not.toContain('secret123pass')
          expect(output).not.toContain('myP@ssw0rd')
        }
      )
    })

    describe('secret redaction', () => {
      test.each([
        { message: 'Secret key: sk_production_abc123' },
        { message: 'secret=very_secret_value' }
      ])(
        'should redact secret - $message',
        ({ message }) => {
          logger.info(message)

          expect(consoleInfoSpy).toHaveBeenCalled()
          const output = consoleInfoSpy.mock.calls[0][0]
          expect(output).toContain('[REDACTED]')
        }
      )
    })

    describe('authorization redaction', () => {
      it('should redact authorization value', () => {
        logger.info('User authorization: Bearer eyJhbGc123')

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('[REDACTED]')
      })
    })

    describe('coordinate patterns in strings', () => {
      it('should handle latitude values in logs', () => {
        logger.info('User location - latitude: -23.5505')

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('latitude')
        expect(output).toContain('-23.5505')
      })

      it('should handle longitude values in logs', () => {
        logger.info('User location - longitude: -46.6333')

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('longitude')
        expect(output).toContain('-46.6333')
      })

      it('should handle latitude and longitude in message', () => {
        logger.info(
          'Search nearby restaurants at latitude: 40.7128, longitude: -74.0060'
        )

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('40.7128')
        expect(output).toContain('-74.0060')
      })
    })

    describe('sanitization in context', () => {
      it('should sanitize string context', () => {
        logger.info('API request', 'API key: secret_key_12345')

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('[REDACTED]')
        expect(output).not.toContain('secret_key_12345')
      })

      it('should sanitize object context with string values', () => {
        const context = {
          action: 'login',
          apiKey: 'key: test_123',
          userId: 1
        }
        logger.info('Authentication', context)

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('[REDACTED]')
        expect(output).not.toContain('test_123')
      })

      it('should not modify original context object', () => {
        const context = {
          message: 'password: secret123',
          count: 5
        }
        const contextCopy = JSON.parse(JSON.stringify(context))

        logger.info('Test', context)

        expect(context).toEqual(contextCopy)
      })

      it('should sanitize Error message in context', () => {
        const error = new Error('Connection failed with password: secret123')
        logger.error('Request failed', error)

        expect(consoleErrorSpy).toHaveBeenCalled()
        const output = consoleErrorSpy.mock.calls[0][0]
        expect(output).toContain('[REDACTED]')
        expect(output).not.toContain('secret123')
      })
    })
  })

  describe('context handling', () => {
    describe('string context', () => {
      it('should handle string context', () => {
        logger.info('Message', 'string context')

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('string context')
      })
    })

    describe('object context', () => {
      it('should handle object context', () => {
        const context = { key: 'value', number: 42 }
        logger.info('Message', context)

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain(JSON.stringify(context))
      })

      it('should handle empty object context', () => {
        logger.info('Message', {})

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('{}')
      })

      it('should preserve non-string properties in object context', () => {
        const context = {
          message: 'test',
          count: 123,
          active: true,
          data: null
        }
        logger.info('Message', context)

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain(JSON.stringify(context))
      })
    })

    describe('Error object context', () => {
      it('should handle Error object with name and message', () => {
        const error = new Error('Test error')
        logger.error('Error occurred', error)

        expect(consoleErrorSpy).toHaveBeenCalled()
        const output = consoleErrorSpy.mock.calls[0][0]
        expect(output).toContain('Error')
        expect(output).toContain('Test error')
      })

      it('should preserve error name', () => {
        const error = new TypeError('Invalid type')
        logger.error('Type error', error)

        expect(consoleErrorSpy).toHaveBeenCalled()
        const output = consoleErrorSpy.mock.calls[0][0]
        expect(output).toContain('TypeError')
      })

      it('should handle null context', () => {
        logger.info('Message', null)

        expect(consoleInfoSpy).toHaveBeenCalled()
        const output = consoleInfoSpy.mock.calls[0][0]
        expect(output).toContain('Message')
      })
    })
  })

  describe('log format', () => {
    it('should include timestamp in ISO format', () => {
      logger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    })

    it('should include log level in brackets', () => {
      logger.info('Info')
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('[INFO]')

      logger.warn('Warning')
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]')

      logger.error('Error')
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]')
    })

    it('should separate timestamp, level, and message', () => {
      logger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toMatch(/\[.+\] \[INFO\] Test message/)
    })

    it('should append context with pipe separator', () => {
      logger.info('Message', { key: 'value' })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain(' | ')
    })
  })

  describe('console method selection', () => {
    it('should use console.debug for debug level', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      logger.debug('Debug')

      expect(consoleDebugSpy).toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should use console.log (info) for info level', () => {
      logger.info('Info')

      expect(consoleInfoSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should use console.warn for warn level', () => {
      logger.warn('Warning')

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should use console.error for error level', () => {
      logger.error('Error')

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    })
  })

  describe('non-string and non-object context types', () => {
    it('should handle array as context', () => {
      const context = ['item1', 'item2', 'item3']
      logger.info('Array context', context)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('item1')
      expect(output).toContain('item2')
      expect(output).toContain('item3')
    })

    it('should handle message with non-string value to sanitizeString', () => {
      logger.info(12345)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('12345')
    })

    it('should handle number as context', () => {
      logger.info('Number context', 42)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('42')
    })

    it('should handle boolean true as context', () => {
      logger.warn('Boolean context', true)

      expect(consoleWarnSpy).toHaveBeenCalled()
      const output = consoleWarnSpy.mock.calls[0][0]
      expect(output).toContain('true')
    })

    it('should not include boolean false context (falsy value)', () => {
      logger.info('Boolean false context', false)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      // false is falsy, so it won't be added to logOutput
      expect(output).not.toContain(' | ')
    })

    it('should stringify array context properly', () => {
      const context = [
        { id: 1, name: 'Action 1' },
        { id: 2, name: 'Action 2' }
      ]
      logger.error('Multiple actions', context)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const output = consoleErrorSpy.mock.calls[0][0]
      expect(output).toContain('Action 1')
      expect(output).toContain('Action 2')
    })
  })

  describe('sanitizeString edge cases', () => {
    it('should handle boolean input as context (true)', () => {
      logger.info('Test', true)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('true')
    })

    it('should handle boolean false (falsy context - not included in output)', () => {
      logger.info('Test message', false)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      // false is falsy, so context is not added
      expect(output).toContain('[INFO] Test message')
      expect(output).not.toContain(' | ')
    })

    it('should handle null input to sanitizeString indirectly', () => {
      logger.info('Test message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('[INFO] Test message')
    })
  })

  describe('no context handling', () => {
    it('should log message without context', () => {
      logger.info('Simple message')

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('Simple message')
      expect(output).not.toContain(' | ')
    })

    it('should log message with undefined context', () => {
      logger.info('Message', undefined)

      expect(consoleInfoSpy).toHaveBeenCalled()
      const output = consoleInfoSpy.mock.calls[0][0]
      expect(output).toContain('Message')
    })
  })
})
