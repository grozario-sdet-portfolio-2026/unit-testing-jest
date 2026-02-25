const {
  EARTH_RADIUS_KM,
  DEGREES_TO_RADIANS,
  DEGREES_PER_KILOMETER,
  DISTANCE_DECIMAL_PLACES,
  DEFAULT_RESTAURANT_NAME,
  DEFAULT_ADDRESS
} = require('../constants')

/**
 * Calculates geographic distance between two points using Haversine formula
 * Provides accurate great-circle distance across the Earth's surface
 *
 * @param {number} startLatitude - Starting point latitude
 * @param {number} startLongitude - Starting point longitude
 * @param {number} endLatitude - Ending point latitude
 * @param {number} endLongitude - Ending point longitude
 * @returns {number} Distance in kilometers, rounded to 2 decimal places
 */
const calculateDistance = (startLatitude, startLongitude, endLatitude, endLongitude) => {
  const latitudeDifference = (endLatitude - startLatitude) * DEGREES_TO_RADIANS
  const longitudeDifference = (endLongitude - startLongitude) * DEGREES_TO_RADIANS

  const haversineComponent =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(startLatitude * DEGREES_TO_RADIANS) *
    Math.cos(endLatitude * DEGREES_TO_RADIANS) *
    Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2)

  const centralAngle = 2 * Math.atan2(
    Math.sqrt(haversineComponent),
    Math.sqrt(1 - haversineComponent)
  )

  const distanceKilometers = EARTH_RADIUS_KM * centralAngle

  const roundingFactor = Math.pow(10, DISTANCE_DECIMAL_PLACES)
  return Math.round(distanceKilometers * roundingFactor) / roundingFactor
}

/**
 * Builds a bounding box (viewbox) string for geographic search constraints
 * Format: min_longitude,min_latitude,max_longitude,max_latitude
 *
 * @param {number} centerLatitude - Center point latitude
 * @param {number} centerLongitude - Center point longitude
 * @param {number} radiusKilometers - Search radius in kilometers
 * @returns {string} Bounding box string for API request
 */
const buildSearchBoundingBox = (centerLatitude, centerLongitude, radiusKilometers) => {
  const offsetDegrees = radiusKilometers * DEGREES_PER_KILOMETER

  const minLongitude = centerLongitude - offsetDegrees
  const minLatitude = centerLatitude - offsetDegrees
  const maxLongitude = centerLongitude + offsetDegrees
  const maxLatitude = centerLatitude + offsetDegrees

  return `${minLongitude},${minLatitude},${maxLongitude},${maxLatitude}`
}

/**
 * Extracts restaurant name from LocationIQ display_name field
 * Uses the first comma-separated component as the name
 *
 * @param {Object} apiResult - Result object from LocationIQ API
 * @returns {string} Restaurant name or default if not found
 */
const extractRestaurantNameFromDisplayName = (apiResult) => {
  if (apiResult.display_name) {
    const firstComponent = apiResult.display_name.split(',')[0].trim()
    if (firstComponent && firstComponent.length > 0) {
      return firstComponent
    }
  }

  if (apiResult.name) {
    return apiResult.name
  }

  return DEFAULT_RESTAURANT_NAME
}

/**
 * Transforms LocationIQ API result into standard restaurant object format
 * Extracts relevant information and calculates distance from search center
 *
 * @param {Object} apiResult - Raw result from LocationIQ API
 * @param {number} centerLatitude - Center point latitude for distance calculation
 * @param {number} centerLongitude - Center point longitude for distance calculation
 * @returns {Object} Standardized restaurant object
 */
const transformLocationIQResultToRestaurant = (apiResult, centerLatitude, centerLongitude) => {
  const restaurantName = extractRestaurantNameFromDisplayName(apiResult)

  const restaurantLatitude = parseFloat(apiResult.lat)
  const restaurantLongitude = parseFloat(apiResult.lon)

  const distanceFromCenter = calculateDistance(
    centerLatitude,
    centerLongitude,
    restaurantLatitude,
    restaurantLongitude
  )

  return {
    id: apiResult.osm_id,
    name: restaurantName,
    address: apiResult.display_name || DEFAULT_ADDRESS,
    latitude: restaurantLatitude,
    longitude: restaurantLongitude,
    type: apiResult.type,
    distanceKilometers: distanceFromCenter
  }
}

/**
 * Processes nearby search API results: transforms, filters, and sorts them
 *
 * @param {Array} apiResults - Raw results from LocationIQ API
 * @param {number} centerLatitude - Center point latitude
 * @param {number} centerLongitude - Center point longitude
 * @param {number} radiusKilometers - Search radius in kilometers
 * @returns {Array} Processed restaurants sorted by distance
 */
const processNearbySearchResults = (apiResults, centerLatitude, centerLongitude, radiusKilometers) => {
  if (!apiResults || apiResults.length === 0) {
    return []
  }

  const processedResults = apiResults.map(apiResult =>
    transformLocationIQResultToRestaurant(apiResult, centerLatitude, centerLongitude)
  )

  const filteredResults = processedResults
    .filter(restaurant => restaurant.distanceKilometers <= radiusKilometers)
    .sort((first, second) => first.distanceKilometers - second.distanceKilometers)

  return filteredResults
}

/**
 * Transforms forward geocoding API result to consistent format
 *
 * @param {Object} apiResult - First result from LocationIQ API
 * @returns {Object} Standardized geocoding result
 */
const transformForwardGeocodeResult = (apiResult) => {
  return {
    address: apiResult.display_name,
    latitude: parseFloat(apiResult.lat),
    longitude: parseFloat(apiResult.lon),
    boundingBox: apiResult.boundingbox || null,
    placeId: apiResult.place_id,
    osmType: apiResult.osm_type,
    confidence: apiResult.importance || 0
  }
}

/**
 * Transforms reverse geocoding API result to consistent format
 *
 * @param {Object} apiResult - Result from LocationIQ reverse API
 * @returns {Object} Standardized reverse geocoding result
 */
const transformReverseGeocodeResult = (apiResult) => {
  const addressComponents = apiResult.address || {}

  return {
    address: apiResult.display_name,
    latitude: parseFloat(apiResult.lat),
    longitude: parseFloat(apiResult.lon),
    city: addressComponents.city || null,
    county: addressComponents.county || null,
    state: addressComponents.state || null,
    country: addressComponents.country || null,
    postalCode: addressComponents.postcode || null,
    placeId: apiResult.place_id,
    osmType: apiResult.osm_type
  }
}

module.exports = {
  calculateDistance,
  buildSearchBoundingBox,
  processNearbySearchResults,
  transformForwardGeocodeResult,
  transformReverseGeocodeResult
}
