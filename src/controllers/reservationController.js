const reservationService = require('../services/reservationService')
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseHandler')
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  ERROR_RESTAURANT_NOT_FOUND,
  ERROR_RESERVATION_NOT_FOUND,
  SUCCESS_RESERVATION_CREATED,
  SUCCESS_RESERVATION_UPDATED,
  SUCCESS_RESERVATION_DELETED,
  SUCCESS_RESERVATION_CANCELLED
} = require('../constants')

const getAllReservations = async (req, res) => {
  try {
    const { restaurant_id } = req.query

    const reservations = restaurant_id
      ? await reservationService.getReservationsByRestaurantId(restaurant_id)
      : await reservationService.getAllReservations()

    sendSuccess(res, HTTP_STATUS_OK, reservations)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

const createReservation = async (req, res) => {
  try {
    const newReservation = await reservationService.createReservation(req.body)
    sendSuccess(res, HTTP_STATUS_CREATED, newReservation, SUCCESS_RESERVATION_CREATED)
  } catch (error) {
    if (error.message === 'Restaurant not found') {
      return sendError(res, 404, ERROR_RESTAURANT_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

const getReservationById = async (req, res) => {
  try {
    const { id } = req.params
    const reservation = await reservationService.getReservationById(id)

    if (!reservation) {
      return sendError(res, 404, ERROR_RESERVATION_NOT_FOUND)
    }

    sendSuccess(res, HTTP_STATUS_OK, reservation)
  } catch (error) {
    return sendValidationError(res, error.message)
  }
}

const updateReservation = async (req, res) => {
  try {
    const { id } = req.params
    const updatedReservation = await reservationService.updateReservation(id, req.body)
    sendSuccess(res, HTTP_STATUS_OK, updatedReservation, SUCCESS_RESERVATION_UPDATED)
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return sendError(res, 404, ERROR_RESERVATION_NOT_FOUND)
    }
    if (error.message === 'Restaurant not found') {
      return sendError(res, 404, ERROR_RESTAURANT_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params
    const result = await reservationService.deleteReservation(id)
    sendSuccess(res, HTTP_STATUS_OK, result, SUCCESS_RESERVATION_DELETED)
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return sendError(res, 404, ERROR_RESERVATION_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    const result = await reservationService.cancelReservation(id)
    sendSuccess(res, HTTP_STATUS_OK, result, SUCCESS_RESERVATION_CANCELLED)
  } catch (error) {
    if (error.message === 'Reservation not found') {
      return sendError(res, 404, ERROR_RESERVATION_NOT_FOUND)
    }
    return sendValidationError(res, error.message)
  }
}

module.exports = {
  getAllReservations,
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  cancelReservation
}
