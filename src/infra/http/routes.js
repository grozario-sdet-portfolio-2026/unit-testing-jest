const express = require('express')
const router = express.Router()

// Controllers
const restaurantController = require('../../controllers/restaurantController')
const reservationController = require('../../controllers/reservationController')

// Validators (Express Middlewares)
const { validateCreateRestaurantMiddleware, validateUpdateRestaurantMiddleware } = require('../../middlewares/restaurantValidator')
const { validateCreateReservationMiddleware, validateUpdateReservationMiddleware } = require('../../middlewares/reservationValidator')
const { validateNearbySearchParamsMiddleware } = require('../../middlewares/locationiqValidator')
const { validateRestaurantIdMiddleware, validateReservationIdMiddleware, validateReservationFiltersMiddleware } = require('../../middlewares/paramValidator')

// Utilities
const { asyncHandler } = require('../../utils/errorHandler')

// ============ RESTAURANT ENDPOINTS ============

router.get('/restaurants', asyncHandler(restaurantController.getAllRestaurants))

router.post('/restaurants', validateCreateRestaurantMiddleware, asyncHandler(restaurantController.createRestaurant))

router.get('/restaurants/nearby', validateNearbySearchParamsMiddleware, asyncHandler(restaurantController.searchNearbyRestaurants))

router.get('/restaurants/:id', validateRestaurantIdMiddleware, asyncHandler(restaurantController.getRestaurantById))

router.put('/restaurants/:id', validateRestaurantIdMiddleware, validateUpdateRestaurantMiddleware, asyncHandler(restaurantController.updateRestaurant))

router.delete('/restaurants/:id', validateRestaurantIdMiddleware, asyncHandler(restaurantController.deleteRestaurant))

// ============ RESERVATION ENDPOINTS ============

router.post('/reservations', validateCreateReservationMiddleware, asyncHandler(reservationController.createReservation))

router.get('/reservations', validateReservationFiltersMiddleware, asyncHandler(reservationController.getAllReservations))

router.get('/reservations/:id', validateReservationIdMiddleware, asyncHandler(reservationController.getReservationById))

router.put('/reservations/:id', validateReservationIdMiddleware, validateUpdateReservationMiddleware, asyncHandler(reservationController.updateReservation))

router.delete('/reservations/:id', validateReservationIdMiddleware, asyncHandler(reservationController.deleteReservation))

router.patch('/reservations/:id/cancel', validateReservationIdMiddleware, asyncHandler(reservationController.cancelReservation))

module.exports = router
