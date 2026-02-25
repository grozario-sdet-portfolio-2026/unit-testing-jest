const {
  createRestaurant: dbCreateRestaurant,
  getAllRestaurants: dbGetAllRestaurants,
  getRestaurantById: dbGetRestaurantById,
  updateRestaurant: dbUpdateRestaurant,
  deleteRestaurant: dbDeleteRestaurant
} = require('../infra/sqlite/database')
const locationiqClient = require('../clients/locationiq')
const locationiqService = require('./locationiqService')
const {
  LOCATION_IQ_NEARBY_SEARCH_RESULT_LIMIT
} = require('../constants')

/**
 * Creates a new restaurant
 * @param {Object} restaurantData - Restaurant information
 * @returns {Promise<Object>} Created restaurant
 */
const createRestaurant = async (restaurantData) => {
  return dbCreateRestaurant(restaurantData)
}

/**
 * Retrieves all restaurants
 * @returns {Promise<Array>} All restaurants
 */
const getAllRestaurants = async () => {
  return dbGetAllRestaurants()
}

/**
 * Retrieves a restaurant by ID
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object|null>} Restaurant object or null if not found
 */
const getRestaurantById = async (restaurantId) => {
  return dbGetRestaurantById(restaurantId)
}

/**
 * Verifies if restaurant exists, throws error if not
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Restaurant object
 * @throws {Error} If restaurant not found
 */
const getRestaurantByIdOrThrow = async (restaurantId) => {
  const restaurant = await dbGetRestaurantById(restaurantId)
  if (!restaurant) {
    throw new Error('Restaurant not found')
  }
  return restaurant
}

/**
 * Merges updated fields with existing restaurant data
 * @param {Object} existingRestaurant - Current restaurant data
 * @param {Object} updateData - New data to merge
 * @returns {Object} Merged data
 */
const mergeRestaurantData = (existingRestaurant, updateData) => {
  const merged = { ...existingRestaurant }
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      merged[key] = updateData[key]
    }
  })
  return merged
}

/**
 * Updates a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @param {Object} restaurantData - Updated restaurant data
 * @returns {Promise<Object>} Updated restaurant
 * @throws {Error} If restaurant not found
 */
const updateRestaurant = async (restaurantId, restaurantData) => {
  const existingRestaurant = await getRestaurantByIdOrThrow(restaurantId)
  const mergedData = mergeRestaurantData(existingRestaurant, restaurantData)
  return dbUpdateRestaurant(restaurantId, mergedData)
}

/**
 * Deletes a restaurant
 * @param {number} restaurantId - Restaurant ID
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} If restaurant not found
 */
const deleteRestaurant = async (restaurantId) => {
  await getRestaurantByIdOrThrow(restaurantId)
  return dbDeleteRestaurant(restaurantId)
}

/**
 * Searches for nearby restaurants using LocationIQ API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radiusMeters - Search radius in meters
 * @param {string} amenity - OSM amenity type
 * @returns {Promise<Object>} Search results with nearby restaurants
 */
const searchNearbyRestaurants = async (latitude, longitude, radiusMeters, amenity) => {
  const latitude_num = parseFloat(latitude)
  const longitude_num = parseFloat(longitude)
  const radius_meters = parseInt(radiusMeters)
  const radiusKilometers = radius_meters / 1000
  const osmTagQuery = `[amenity=${amenity}]`

  const boundingBox = locationiqService.buildSearchBoundingBox(
    latitude_num,
    longitude_num,
    radiusKilometers
  )

  const apiResults = await locationiqClient.requestNearbySearch(
    osmTagQuery,
    boundingBox,
    LOCATION_IQ_NEARBY_SEARCH_RESULT_LIMIT
  )

  const nearbyRestaurants = locationiqService.processNearbySearchResults(
    apiResults,
    latitude_num,
    longitude_num,
    radiusKilometers
  )

  return {
    success: true,
    data: nearbyRestaurants,
    count: nearbyRestaurants.length,
    searchParams: {
      latitude: latitude_num,
      longitude: longitude_num,
      radiusMeters: radius_meters,
      amenity
    }
  }
}

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantByIdOrThrow,
  mergeRestaurantData,
  updateRestaurant,
  deleteRestaurant,
  searchNearbyRestaurants
}
