const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

const SENSITIVE_PATTERNS = {
  apiKey: /key\s*[:=]\s*[^\s,}]+/gi,
  token: /token\s*[:=]\s*[^\s,}]+/gi,
  password: /password\s*[:=]\s*[^\s,}]+/gi,
  secret: /secret\s*[:=]\s*[^\s,}]+/gi,
  authorization: /authorization\s*[:=]\s*[^\s,}]+/gi,
  latitude: /latitude[=:]\s*([\d.-]+)/gi,
  longitude: /longitude[=:]\s*([\d.-]+)/gi
}

/**
 * Redacts sensitive information from strings
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeString = (text) => {
  if (typeof text !== 'string') return text

  let sanitized = text

  sanitized = sanitized.replace(SENSITIVE_PATTERNS.apiKey, 'key: [REDACTED]')
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.token, 'token: [REDACTED]')
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.password, 'password: [REDACTED]')
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.secret, 'secret: [REDACTED]')
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.authorization, 'authorization: [REDACTED]')

  return sanitized
}

/**
 * Formats timestamp for logs
 * @returns {string} ISO timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString()
}

/**
 * Logs message with specified level
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {any} context - Additional context (optional)
 */
const log = (level, message, context = null) => {
  const timestamp = getTimestamp()
  const sanitizedMessage = sanitizeString(message)

  let logOutput = `[${timestamp}] [${level}] ${sanitizedMessage}`

  if (context) {
    let sanitizedContext = context

    if (typeof context === 'string') {
      sanitizedContext = sanitizeString(context)
    } else if (context instanceof Error) {
      sanitizedContext = {
        name: context.name,
        message: sanitizeString(context.message),
        stack: process.env.NODE_ENV === 'development' ? context.stack : '[Stack trace hidden in production]'
      }
    } else if (typeof context === 'object') {
      sanitizedContext = { ...context }
      Object.keys(sanitizedContext).forEach((key) => {
        if (typeof sanitizedContext[key] === 'string') {
          sanitizedContext[key] = sanitizeString(sanitizedContext[key])
        }
      })
    }

    logOutput += ` | ${JSON.stringify(sanitizedContext)}`
  }

  switch (level) {
  case LogLevel.ERROR:
    console.error(logOutput)
    break
  case LogLevel.WARN:
    console.warn(logOutput)
    break
  case LogLevel.DEBUG:
    if (process.env.NODE_ENV === 'development') {
      console.debug(logOutput)
    }
    break
  case LogLevel.INFO:
  default:
    console.log(logOutput)
    break
  }
}

/**
 * Public logging methods
 */
const logger = {
  /**
   * Logs debug information (only in development)
   * @param {string} message - Debug message
   * @param {any} context - Additional context
   */
  debug: (message, context) => {
    log(LogLevel.DEBUG, message, context)
  },

  /**
   * Logs general information
   * @param {string} message - Info message
   * @param {any} context - Additional context
   */
  info: (message, context) => {
    log(LogLevel.INFO, message, context)
  },

  /**
   * Logs warnings
   * @param {string} message - Warning message
   * @param {any} context - Additional context
   */
  warn: (message, context) => {
    log(LogLevel.WARN, message, context)
  },

  /**
   * Logs errors (includes stack trace in development)
   * @param {string} message - Error message
   * @param {any} error - Error object or additional context
   */
  error: (message, error) => {
    log(LogLevel.ERROR, message, error)
  }
}

module.exports = logger
