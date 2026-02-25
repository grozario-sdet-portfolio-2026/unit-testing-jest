const restaurantService = require('../services/restaurantService')
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseHandler')
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  ERROR_RESTAURANT_NOT_FOUND,
  SUCCESS_RESTAURANT_CREATED,
  SUCCESS_RESTAURANT_UPDATED,
  SUCCESS_RESTAURANT_DELETED
} = require('../constants')

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getAllRestaurants()
    sendSuccess(res, HTTP_STATUS_OK, restaurants)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

const createRestaurant = async (req, res) => {
  try {
    const newRestaurant = await restaurantService.createRestaurant(req.body)
    sendSuccess(res, HTTP_STATUS_CREATED, newRestaurant, SUCCESS_RESTAURANT_CREATED)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params
    const restaurant = await restaurantService.getRestaurantById(id)

    if (!restaurant) {
      return sendError(res, 404, ERROR_RESTAURANT_NOT_FOUND)
    }

    sendSuccess(res, HTTP_STATUS_OK, restaurant)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params
    const updatedRestaurant = await restaurantService.updateRestaurant(id, req.body)
    sendSuccess(res, HTTP_STATUS_OK, updatedRestaurant, SUCCESS_RESTAURANT_UPDATED)
  } catch (error) {
    if (error.message === 'Restaurant not found') {
      return sendError(res, 404, ERROR_RESTAURANT_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params
    const result = await restaurantService.deleteRestaurant(id)
    sendSuccess(res, HTTP_STATUS_OK, result, SUCCESS_RESTAURANT_DELETED)
  } catch (error) {
    if (error.message === 'Restaurant not found') {
      return sendError(res, 404, ERROR_RESTAURANT_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

const searchNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000, amenity = 'restaurant' } = req.query
    const result = await restaurantService.searchNearbyRestaurants(
      latitude,
      longitude,
      radius,
      amenity
    )
    res.status(HTTP_STATUS_OK).json(result)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

module.exports = {
  getAllRestaurants,
  createRestaurant,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  searchNearbyRestaurants
}
