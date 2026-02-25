const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const logger = require('../../utils/logger')
const {
  DATABASE_FILENAME,
  DATABASE_PATH
} = require('../../constants')

const databaseFilePath = path.join(__dirname, `../../../${DATABASE_PATH}/${DATABASE_FILENAME}`)

let isConnected = false

const database = new sqlite3.Database(databaseFilePath, (error) => {
  if (error) {
    isConnected = false
    logger.error('Failed to connect to database', {
      database: DATABASE_FILENAME,
      error: error.message,
      code: error.code
    })
  } else {
    isConnected = true
    logger.info('Successfully connected to SQLite database', {
      database: DATABASE_FILENAME
    })
  }
})

database.on('error', (error) => {
  logger.error('Database error occurred', {
    error: error.message,
    code: error.code
  })
})

/**
 * Initializes database tables if they don't already exist
 * Creates 'restaurants' and 'reservations' tables with proper schema
 * Logs any errors but doesn't crash
 */
function initializeTables () {
  database.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      capacity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (error) => {
    if (error) {
      logger.error('Failed to create restaurants table', {
        error: error.message
      })
    } else {
      logger.debug('Restaurants table initialized')
    }
  })

  database.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      restaurant_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      number_of_people INTEGER NOT NULL,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
    )
  `, (error) => {
    if (error) {
      logger.error('Failed to create reservations table', {
        error: error.message
      })
    } else {
      logger.debug('Reservations table initialized')
    }
  })
}

database.on('open', () => {
  initializeTables()
})

/**
 * Checks if database connection is active
 * @returns {boolean} True if connected
 */
const isConnectedToDB = () => isConnected

/**
 * Clears all data from the database (for testing purposes)
 * Deletes all reservations and restaurants
 * Logs any errors that occur
 * @returns {Promise<void>}
 */
const clearAllData = () => {
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run('DELETE FROM reservations', (error) => {
        if (error) {
          logger.error('Failed to clear reservations table', {
            error: error.message
          })
          return reject(error)
        }
      })

      database.run('DELETE FROM restaurants', (error) => {
        if (error) {
          logger.error('Failed to clear restaurants table', {
            error: error.message
          })
          return reject(error)
        }

        logger.debug('Database cleared successfully')
        resolve()
      })
    })
  })
}

/**
 * Gracefully closes the database connection
 * Used for cleanup during shutdown
 * @returns {Promise<void>}
 */
const closeConnection = () => {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      return resolve()
    }

    database.close((error) => {
      if (error) {
        logger.error('Error closing database connection', {
          error: error.message
        })
        return reject(error)
      }

      isConnected = false
      logger.info('Database connection closed')
      resolve()
    })
  })
}

module.exports = {
  database,
  clearAllData,
  isConnectedToDB,
  closeConnection
}
