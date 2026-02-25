const axios = require('axios')
const logger = require('../utils/logger')
const { handleExternalApiError } = require('../utils/errorHandler')
const {
  LOCATION_IQ_API_KEY,
  LOCATION_IQ_BASE_URL,
  LOCATION_IQ_API_TIMEOUT_MS,
  LOCATION_IQ_BOUNDED_SEARCH_ENABLED
} = require('../constants')

if (!LOCATION_IQ_API_KEY) {
  logger.warn('LocationIQ API key is not configured. Some features may not work.')
}

/**
 * Makes HTTP request to LocationIQ nearby search endpoint
 * ONLY handles HTTP communication, no validation or processing
 *
 * @param {string} osmTagQuery - OpenStreetMap tag query (e.g., '[amenity=restaurant]')
 * @param {string} boundingBox - Bounding box string (min_lon,min_lat,max_lon,max_lat)
 * @param {number} resultLimit - Maximum number of results to return
 * @returns {Promise<Array>} Raw API response array
 * @throws {Error} If API call fails
 */
const requestNearbySearch = async (osmTagQuery, boundingBox, resultLimit) => {
  try {
    logger.debug('LocationIQ nearby search request', { osmTagQuery, boundingBox })

    const response = await axios.get(`${LOCATION_IQ_BASE_URL}/search.php`, {
      params: {
        key: LOCATION_IQ_API_KEY,
        q: osmTagQuery,
        format: 'json',
        limit: resultLimit,
        bounded: LOCATION_IQ_BOUNDED_SEARCH_ENABLED,
        viewbox: boundingBox
      },
      timeout: LOCATION_IQ_API_TIMEOUT_MS
    })

    logger.debug('LocationIQ nearby search success', { resultCount: (response.data || []).length })
    return response.data || []
  } catch (error) {
    handleExternalApiError(error, 'nearby_search', { timeout: LOCATION_IQ_API_TIMEOUT_MS })
  }
}

/**
 * Makes HTTP request to LocationIQ forward geocoding endpoint
 * ONLY handles HTTP communication, no validation or processing
 *
 * @param {string} address - Address string to geocode
 * @param {number} resultLimit - Maximum number of results to return
 * @returns {Promise<Array>} Raw API response array
 * @throws {Error} If API call fails or no results found
 */
const requestForwardGeocode = async (address, resultLimit) => {
  try {
    logger.debug('LocationIQ forward geocode request', { address })

    const response = await axios.get(`${LOCATION_IQ_BASE_URL}/search.php`, {
      params: {
        key: LOCATION_IQ_API_KEY,
        q: address,
        format: 'json',
        limit: resultLimit
      },
      timeout: LOCATION_IQ_API_TIMEOUT_MS
    })

    const data = response.data || []
    if (data.length === 0) {
      logger.info('No geocoding results found for address', { address })
      throw new Error(`No results found for address: ${address}`)
    }

    logger.debug('LocationIQ forward geocode success', { resultCount: data.length })
    return data[0] // Return first result
  } catch (error) {
    if (error.message.includes('No results found')) {
      throw error // Re-throw non-API errors
    }
    handleExternalApiError(error, 'forward_geocode', { timeout: LOCATION_IQ_API_TIMEOUT_MS })
  }
}

/**
 * Makes HTTP request to LocationIQ reverse geocoding endpoint
 * ONLY handles HTTP communication, no validation or processing
 *
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Raw API response object
 * @throws {Error} If API call fails
 */
const requestReverseGeocode = async (latitude, longitude) => {
  try {
    logger.debug('LocationIQ reverse geocode request', { latitude, longitude })

    const response = await axios.get(`${LOCATION_IQ_BASE_URL}/reverse.php`, {
      params: {
        key: LOCATION_IQ_API_KEY,
        lat: latitude,
        lon: longitude,
        format: 'json'
      },
      timeout: LOCATION_IQ_API_TIMEOUT_MS
    })

    logger.debug('LocationIQ reverse geocode success')
    return response.data
  } catch (error) {
    handleExternalApiError(error, 'reverse_geocode', { timeout: LOCATION_IQ_API_TIMEOUT_MS })
  }
}

module.exports = {
  requestNearbySearch,
  requestForwardGeocode,
  requestReverseGeocode
}
