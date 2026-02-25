const reservationService = require('../../../src/services/reservationService')
const reservationController = require('../../../src/controllers/reservationController')
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  ERROR_RESTAURANT_NOT_FOUND,
  ERROR_RESERVATION_NOT_FOUND,
  SUCCESS_RESERVATION_CREATED,
  SUCCESS_RESERVATION_UPDATED,
  SUCCESS_RESERVATION_DELETED,
  SUCCESS_RESERVATION_CANCELLED
} = require('../../../src/constants')

const {
  sendSuccess,
  sendError,
  sendValidationError
} = require('../../../src/utils/responseHandler')

jest.mock('../../../src/services/reservationService', () => ({
  getReservationsByRestaurantId: jest.fn(),
  getAllReservations: jest.fn(),
  createReservation: jest.fn(),
  getReservationById: jest.fn(),
  updateReservation: jest.fn(),
  deleteReservation: jest.fn(),
  cancelReservation: jest.fn()
}))
jest.mock('../../../src/utils/responseHandler')
jest.mock('../../../src/constants', () => ({
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_CREATED: 201,
  ERROR_RESTAURANT_NOT_FOUND: 'test Restaurant not found',
  ERROR_RESERVATION_NOT_FOUND: 'test Reservation not found',
  SUCCESS_RESERVATION_CREATED: 'test Reservation created successfully',
  SUCCESS_RESERVATION_UPDATED: 'testReservation updated successfully',
  SUCCESS_RESERVATION_DELETED: 'test Reservation deleted successfully',
  SUCCESS_RESERVATION_CANCELLED: 'testReservation cancelled successfully'
}))

describe('Reservation Controller', () => {
  let req, res

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    }
    res = {}

    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('getAllReservations', () => {
    describe('successfully get reservations', () => {
      it('should retrieve get reservations by restaurant_id and send success response', async () => {
        req.query = { restaurant_id: 1 }

        const mockReservations = [
          { id: 1, restaurant_id: 1, number_of_people: 4 }
        ]
        reservationService.getReservationsByRestaurantId.mockResolvedValue(
          mockReservations
        )

        const expectedTest = {
          getReservationsByRestaurantIdResult: mockReservations,
          getReservationsByRestaurantIdParam: req.query.restaurant_id,
          sendSuccessParams: [res, HTTP_STATUS_OK, mockReservations]
        }

        await reservationController.getAllReservations(req, res)

        expect(
          reservationService.getReservationsByRestaurantId
        ).toHaveBeenCalledWith(expectedTest.getReservationsByRestaurantIdParam)
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(reservationService.getAllReservations).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should retrieve get all reservations and send success response', async () => {
        const mockReservations = [
          { id: 1, restaurant_id: 1, number_of_people: 4 },
          { id: 2, restaurant_id: 2, number_of_people: 2 }
        ]
        reservationService.getAllReservations.mockResolvedValue(
          mockReservations
        )

        const expectedTest = {
          getAllReservationsResult: mockReservations,
          sendSuccessParams: [res, HTTP_STATUS_OK, mockReservations]
        }

        await reservationController.getAllReservations(req, res)

        expect(reservationService.getAllReservations).toHaveBeenCalled()
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(
          reservationService.getReservationsByRestaurantId
        ).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while retrieving reservations', () => {
      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        reservationService.getAllReservations.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.getAllReservations(req, res)

        expect(reservationService.getAllReservations).toHaveBeenCalled()
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(
          reservationService.getReservationsByRestaurantId
        ).not.toHaveBeenCalled()
        expect(sendSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('createReservation', () => {
    describe('successfully create reservation', () => {
      it('should create a reservation and send success response', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 4,
          reservation_date: '2026-03-15',
          reservation_time: '19:00'
        }
        const createdReservation = { id: 1, ...reservationData, status: 'confirmed' }
        req.body = reservationData
        reservationService.createReservation.mockResolvedValue(createdReservation)

        const expectedTest = {
          createReservationResult: createdReservation,
          createReservationParam: reservationData,
          sendSuccessParams: [res, HTTP_STATUS_CREATED, createdReservation, SUCCESS_RESERVATION_CREATED]
        }

        await reservationController.createReservation(req, res)

        expect(reservationService.createReservation).toHaveBeenCalledWith(
          expectedTest.createReservationParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while creating reservation', () => {
      it('should send 404 error when restaurant not found', async () => {
        const error = new Error('Restaurant not found')
        reservationService.createReservation.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESTAURANT_NOT_FOUND]
        }

        await reservationController.createReservation(req, res)

        expect(reservationService.createReservation).toHaveBeenCalled()
        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle validation errors and send validation error response', async () => {
        const error = new Error('Group size exceeds capacity')
        reservationService.createReservation.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.createReservation(req, res)

        expect(reservationService.createReservation).toHaveBeenCalled()
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('getReservationById', () => {
    describe('successfully get reservation by ID', () => {
      it('should retrieve a reservation by ID and send success response', async () => {
        const reservation = { id: 1, restaurant_id: 1, number_of_people: 4 }
        req.params.id = 1
        reservationService.getReservationById.mockResolvedValue(reservation)

        const expectedTest = {
          getReservationByIdResult: reservation,
          getReservationByIdParam: req.params.id,
          sendSuccessParams: [res, HTTP_STATUS_OK, reservation]
        }

        await reservationController.getReservationById(req, res)

        expect(reservationService.getReservationById).toHaveBeenCalledWith(
          expectedTest.getReservationByIdParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while retrieving reservation', () => {
      it('should send 404 error when reservation not found', async () => {
        req.params.id = 999
        reservationService.getReservationById.mockResolvedValue(null)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESERVATION_NOT_FOUND]
        }

        await reservationController.getReservationById(req, res)

        expect(reservationService.getReservationById).toHaveBeenCalledWith(999)
        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        req.params.id = 1
        reservationService.getReservationById.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.getReservationById(req, res)

        expect(reservationService.getReservationById).toHaveBeenCalledWith(1)
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('updateReservation', () => {
    describe('successfully update reservation', () => {
      it('should update a reservation and send success response', async () => {
        const updateData = { number_of_people: 6 }
        const updatedReservation = { id: 1, restaurant_id: 1, number_of_people: 6, status: 'confirmed' }
        req.params.id = 1
        req.body = updateData
        reservationService.updateReservation.mockResolvedValue(updatedReservation)

        const expectedTest = {
          updateReservationResult: updatedReservation,
          updateReservationParams: [req.params.id, updateData],
          sendSuccessParams: [res, HTTP_STATUS_OK, updatedReservation, SUCCESS_RESERVATION_UPDATED]
        }

        await reservationController.updateReservation(req, res)

        expect(reservationService.updateReservation).toHaveBeenCalledWith(
          ...expectedTest.updateReservationParams
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while updating reservation', () => {
      it('should send 404 error when reservation not found', async () => {
        const error = new Error('Reservation not found')
        req.params.id = 999
        reservationService.updateReservation.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESERVATION_NOT_FOUND]
        }

        await reservationController.updateReservation(req, res)

        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should send 404 error when restaurant not found', async () => {
        const error = new Error('Restaurant not found')
        req.params.id = 1
        reservationService.updateReservation.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESTAURANT_NOT_FOUND]
        }

        await reservationController.updateReservation(req, res)

        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle validation errors and send validation error response', async () => {
        const error = new Error('Group size exceeds capacity')
        req.params.id = 1
        reservationService.updateReservation.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.updateReservation(req, res)

        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('deleteReservation', () => {
    describe('successfully delete reservation', () => {
      it('should delete a reservation and send success response', async () => {
        const result = { success: true }
        req.params.id = 1
        reservationService.deleteReservation.mockResolvedValue(result)

        const expectedTest = {
          deleteReservationResult: result,
          deleteReservationParam: req.params.id,
          sendSuccessParams: [res, HTTP_STATUS_OK, result, SUCCESS_RESERVATION_DELETED]
        }

        await reservationController.deleteReservation(req, res)

        expect(reservationService.deleteReservation).toHaveBeenCalledWith(
          expectedTest.deleteReservationParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while deleting reservation', () => {
      it('should send 404 error when reservation not found', async () => {
        const error = new Error('Reservation not found')
        req.params.id = 999
        reservationService.deleteReservation.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESERVATION_NOT_FOUND]
        }

        await reservationController.deleteReservation(req, res)

        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        req.params.id = 1
        reservationService.deleteReservation.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.deleteReservation(req, res)

        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('cancelReservation', () => {
    describe('successfully cancel reservation', () => {
      it('should cancel a reservation and send success response', async () => {
        const result = { id: 1, status: 'cancelled' }
        req.params.id = 1
        reservationService.cancelReservation.mockResolvedValue(result)

        const expectedTest = {
          cancelReservationResult: result,
          cancelReservationParam: req.params.id,
          sendSuccessParams: [res, HTTP_STATUS_OK, result, SUCCESS_RESERVATION_CANCELLED]
        }

        await reservationController.cancelReservation(req, res)

        expect(reservationService.cancelReservation).toHaveBeenCalledWith(
          expectedTest.cancelReservationParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while canceling reservation', () => {
      it('should send 404 error when reservation not found', async () => {
        const error = new Error('Reservation not found')
        req.params.id = 999
        reservationService.cancelReservation.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESERVATION_NOT_FOUND]
        }

        await reservationController.cancelReservation(req, res)

        expect(sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        req.params.id = 1
        reservationService.cancelReservation.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await reservationController.cancelReservation(req, res)

        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })
})
