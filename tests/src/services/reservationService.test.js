const reservationService = require('../../../src/services/reservationService')
const {
  createReservation: dbCreateReservation,
  getAllReservations: dbGetAllReservations,
  getReservationById: dbGetReservationById,
  getReservationsByRestaurantId: dbGetReservationsByRestaurantId,
  updateReservation: dbUpdateReservation,
  deleteReservation: dbDeleteReservation,
  cancelReservation: dbCancelReservation,
  getRestaurantById: dbGetRestaurantById
} = require('../../../src/infra/sqlite/database')

const reservationValidator = require('../../../src/middlewares/reservationValidator')

jest.mock('../../../src/infra/sqlite/database', () => ({
  createReservation: jest.fn(),
  getAllReservations: jest.fn(),
  getReservationById: jest.fn(),
  getReservationsByRestaurantId: jest.fn(),
  updateReservation: jest.fn(),
  deleteReservation: jest.fn(),
  cancelReservation: jest.fn(),
  getRestaurantById: jest.fn()
}))

jest.mock('../../../src/middlewares/reservationValidator', () => ({
  validateGroupSizeAgainstCapacity: jest.fn()
}))

describe('Reservation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllReservations', () => {
    describe('successful retrieval', () => {
      it('should retrieve all reservations from database', async () => {
        const mockReservations = [
          {
            id: 1,
            restaurant_id: 1,
            number_of_people: 4,
            status: 'confirmed'
          },
          {
            id: 2,
            restaurant_id: 2,
            number_of_people: 2,
            status: 'confirmed'
          }
        ]

        dbGetAllReservations.mockResolvedValue(mockReservations)

        const result = await reservationService.getAllReservations()

        expect(dbGetAllReservations).toHaveBeenCalled()
        expect(result).toEqual(mockReservations)
        expect(result).toHaveLength(2)
      })

      it('should return empty array when no reservations exist', async () => {
        dbGetAllReservations.mockResolvedValue([])

        const result = await reservationService.getAllReservations()

        expect(result).toEqual([])
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const error = new Error('Database error')

        dbGetAllReservations.mockRejectedValue(error)

        await expect(reservationService.getAllReservations()).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('getReservationsByRestaurantId', () => {
    describe('successful retrieval', () => {
      it('should retrieve reservations for a specific restaurant', async () => {
        const restaurantId = 1
        const mockReservations = [
          { id: 1, restaurant_id: 1, number_of_people: 4 },
          { id: 2, restaurant_id: 1, number_of_people: 2 }
        ]

        dbGetReservationsByRestaurantId.mockResolvedValue(mockReservations)

        const result = await reservationService.getReservationsByRestaurantId(
          restaurantId
        )

        expect(dbGetReservationsByRestaurantId).toHaveBeenCalledWith(
          restaurantId
        )
        expect(result).toEqual(mockReservations)
      })

      it('should return empty array when no reservations for restaurant', async () => {
        dbGetReservationsByRestaurantId.mockResolvedValue([])

        const result = await reservationService.getReservationsByRestaurantId(
          999
        )

        expect(result).toEqual([])
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const error = new Error('Database error')

        dbGetReservationsByRestaurantId.mockRejectedValue(error)

        await expect(
          reservationService.getReservationsByRestaurantId(1)
        ).rejects.toThrow('Database error')
      })
    })
  })

  describe('getReservationById', () => {
    describe('successful retrieval', () => {
      it('should retrieve reservation by ID', async () => {
        const mockReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed'
        }

        dbGetReservationById.mockResolvedValue(mockReservation)

        const result = await reservationService.getReservationById(1)

        expect(dbGetReservationById).toHaveBeenCalledWith(1)
        expect(result).toEqual(mockReservation)
      })

      it('should return null when reservation not found', async () => {
        dbGetReservationById.mockResolvedValue(null)

        const result = await reservationService.getReservationById(999)

        expect(result).toBeNull()
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const error = new Error('Database error')

        dbGetReservationById.mockRejectedValue(error)

        await expect(reservationService.getReservationById(1)).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('getReservationByIdOrThrow', () => {
    describe('successful retrieval', () => {
      it('should return reservation when found', async () => {
        const mockReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4
        }

        dbGetReservationById.mockResolvedValue(mockReservation)

        const result = await reservationService.getReservationByIdOrThrow(1)

        expect(result).toEqual(mockReservation)
      })
    })

    describe('error cases', () => {
      it('should throw error when reservation not found', async () => {
        dbGetReservationById.mockResolvedValue(null)

        await expect(
          reservationService.getReservationByIdOrThrow(999)
        ).rejects.toThrow('Reservation not found')
      })

      it('should throw with specific error message', async () => {
        dbGetReservationById.mockResolvedValue(null)

        await expect(reservationService.getReservationByIdOrThrow(1))
          .rejects
          .toThrow('Reservation not found')
      })
    })
  })

  describe('mergeReservationData', () => {
    describe('data merging', () => {
      it('should merge update data with existing reservation data', () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed',
          date: '2025-01-01',
          time: '19:00'
        }

        const updateData = {
          status: 'cancelled'
        }

        const result = reservationService.mergeReservationData(
          existingReservation,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'cancelled',
          date: '2025-01-01',
          time: '19:00'
        })
      })

      it('should not override with undefined values', () => {
        const existingReservation = {
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed'
        }

        const updateData = {
          number_of_people: 6,
          status: undefined,
          notes: null
        }

        const result = reservationService.mergeReservationData(
          existingReservation,
          updateData
        )

        expect(result.number_of_people).toBe(6)
        expect(result.status).toBe('confirmed')
        expect(result.notes).toBeUndefined()
      })

      it('should not modify original objects', () => {
        const existingReservation = {
          number_of_people: 4,
          status: 'confirmed'
        }

        const updateData = {
          number_of_people: 6
        }

        const originalCopy = JSON.parse(JSON.stringify(existingReservation))

        reservationService.mergeReservationData(
          existingReservation,
          updateData
        )

        expect(existingReservation).toEqual(originalCopy)
      })

      it('should handle empty update data', () => {
        const existingReservation = {
          number_of_people: 4,
          status: 'confirmed'
        }

        const result = reservationService.mergeReservationData(
          existingReservation,
          {}
        )

        expect(result).toEqual(existingReservation)
      })

      it('should add new properties from update data', () => {
        const existingReservation = {
          restaurant_id: 1,
          number_of_people: 4
        }

        const updateData = {
          notes: 'Special dietary requirements',
          phone: '123-456-7890'
        }

        const result = reservationService.mergeReservationData(
          existingReservation,
          updateData
        )

        expect(result.notes).toBe('Special dietary requirements')
        expect(result.phone).toBe('123-456-7890')
      })
    })
  })

  describe('createReservation', () => {
    describe('successful creation', () => {
      it('should create reservation with restaurant existence validation', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 4,
          date: '2025-01-15',
          time: '19:00'
        }

        const mockRestaurant = {
          id: 1,
          name: 'Restaurant',
          capacity: 100
        }

        const mockCreatedReservation = {
          id: 1,
          ...reservationData,
          status: 'confirmed'
        }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        dbCreateReservation.mockResolvedValue(mockCreatedReservation)

        const result = await reservationService.createReservation(
          reservationData
        )

        expect(dbGetRestaurantById).toHaveBeenCalledWith(1)
        expect(reservationValidator.validateGroupSizeAgainstCapacity).toHaveBeenCalledWith(
          4,
          100
        )
        expect(dbCreateReservation).toHaveBeenCalledWith({
          ...reservationData,
          status: 'confirmed'
        })
        expect(result).toEqual(mockCreatedReservation)
      })

      it('should use default status when not provided', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 2
        }

        const mockRestaurant = {
          id: 1,
          capacity: 50
        }

        const mockCreatedReservation = {
          id: 1,
          ...reservationData,
          status: 'confirmed'
        }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        dbCreateReservation.mockResolvedValue(mockCreatedReservation)

        await reservationService.createReservation(reservationData)

        expect(dbCreateReservation).toHaveBeenCalledWith({
          ...reservationData,
          status: 'confirmed'
        })
      })

      it('should use provided status if specified', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 2,
          status: 'pending'
        }

        const mockRestaurant = { id: 1, capacity: 50 }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        dbCreateReservation.mockResolvedValue({
          id: 1,
          ...reservationData
        })

        await reservationService.createReservation(reservationData)

        expect(dbCreateReservation).toHaveBeenCalledWith({
          ...reservationData,
          status: 'pending'
        })
      })
    })

    describe('error cases', () => {
      it('should throw error when restaurant not found', async () => {
        const reservationData = {
          restaurant_id: 999,
          number_of_people: 4
        }

        dbGetRestaurantById.mockResolvedValue(null)

        await expect(
          reservationService.createReservation(reservationData)
        ).rejects.toThrow('Restaurant not found')

        expect(dbCreateReservation).not.toHaveBeenCalled()
      })

      it('should throw error when group size exceeds capacity', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 200
        }

        const mockRestaurant = {
          id: 1,
          capacity: 50
        }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        reservationValidator.validateGroupSizeAgainstCapacity.mockImplementation(
          () => {
            throw new Error('Number of people (200) exceeds restaurant capacity (50)')
          }
        )

        await expect(
          reservationService.createReservation(reservationData)
        ).rejects.toThrow()

        expect(dbCreateReservation).not.toHaveBeenCalled()
      })

      it('should propagate database errors', async () => {
        const reservationData = {
          restaurant_id: 1,
          number_of_people: 4
        }

        const mockRestaurant = { id: 1, capacity: 100 }
        const dbError = new Error('Database error')

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        reservationValidator.validateGroupSizeAgainstCapacity.mockImplementation(() => {})
        dbCreateReservation.mockRejectedValue(dbError)

        await expect(
          reservationService.createReservation(reservationData)
        ).rejects.toThrow('Database error')
      })
    })
  })

  describe('updateReservation', () => {
    describe('successful update', () => {
      it('should update reservation with capacity validation when number_of_people changes', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed'
        }

        const updateData = {
          number_of_people: 6
        }

        const mockRestaurant = {
          id: 1,
          capacity: 100
        }

        const updatedReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 6,
          status: 'confirmed'
        }

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        reservationValidator.validateGroupSizeAgainstCapacity.mockImplementation(() => {})
        dbUpdateReservation.mockResolvedValue(updatedReservation)

        const result = await reservationService.updateReservation(
          1,
          updateData
        )

        expect(reservationValidator.validateGroupSizeAgainstCapacity).toHaveBeenCalledWith(
          6,
          100
        )
        expect(result).toEqual(updatedReservation)
      })

      it('should skip capacity validation when number_of_people not being updated', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed'
        }

        const updateData = {
          status: 'cancelled'
        }

        const updatedReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'cancelled'
        }

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbUpdateReservation.mockResolvedValue(updatedReservation)

        await reservationService.updateReservation(1, updateData)

        expect(dbGetRestaurantById).not.toHaveBeenCalled()
        expect(
          reservationValidator.validateGroupSizeAgainstCapacity
        ).not.toHaveBeenCalled()
      })

      it('should merge update data with existing reservation', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed',
          date: '2025-01-15'
        }

        const updateData = {
          date: '2025-02-15'
        }

        const expectedMerged = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed',
          date: '2025-02-15'
        }

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbUpdateReservation.mockResolvedValue(expectedMerged)

        await reservationService.updateReservation(1, updateData)

        expect(dbUpdateReservation).toHaveBeenCalledWith(1, expectedMerged)
      })
    })

    describe('error cases', () => {
      it('should throw error when reservation not found', async () => {
        const updateData = { status: 'cancelled' }

        dbGetReservationById.mockResolvedValue(null)

        await expect(
          reservationService.updateReservation(999, updateData)
        ).rejects.toThrow('Reservation not found')

        expect(dbUpdateReservation).not.toHaveBeenCalled()
      })

      it('should throw error when restaurant not found during capacity validation', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 999,
          number_of_people: 4
        }

        const updateData = {
          number_of_people: 10
        }

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbGetRestaurantById.mockResolvedValue(null)

        await expect(
          reservationService.updateReservation(1, updateData)
        ).rejects.toThrow('Restaurant not found')

        expect(dbUpdateReservation).not.toHaveBeenCalled()
      })

      it('should throw error when new group size exceeds capacity', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4
        }

        const updateData = {
          number_of_people: 200
        }

        const mockRestaurant = {
          id: 1,
          capacity: 50
        }

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        reservationValidator.validateGroupSizeAgainstCapacity.mockImplementation(
          () => {
            throw new Error('Number of people (200) exceeds restaurant capacity (50)')
          }
        )

        await expect(
          reservationService.updateReservation(1, updateData)
        ).rejects.toThrow()

        expect(dbUpdateReservation).not.toHaveBeenCalled()
      })

      it('should propagate database errors', async () => {
        const existingReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4
        }

        const updateData = {
          status: 'cancelled'
        }

        const dbError = new Error('Database error')

        dbGetReservationById.mockResolvedValue(existingReservation)
        dbUpdateReservation.mockRejectedValue(dbError)

        await expect(
          reservationService.updateReservation(1, updateData)
        ).rejects.toThrow('Database error')
      })
    })
  })

  describe('deleteReservation', () => {
    describe('successful deletion', () => {
      it('should delete existing reservation', async () => {
        const mockReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4
        }

        const deletionResult = { success: true }

        dbGetReservationById.mockResolvedValue(mockReservation)
        dbDeleteReservation.mockResolvedValue(deletionResult)

        const result = await reservationService.deleteReservation(1)

        expect(dbGetReservationById).toHaveBeenCalledWith(1)
        expect(dbDeleteReservation).toHaveBeenCalledWith(1)
        expect(result).toEqual(deletionResult)
      })
    })

    describe('error cases', () => {
      it('should throw error when reservation not found', async () => {
        dbGetReservationById.mockResolvedValue(null)

        await expect(reservationService.deleteReservation(999)).rejects.toThrow(
          'Reservation not found'
        )

        expect(dbDeleteReservation).not.toHaveBeenCalled()
      })

      it('should propagate database errors during deletion', async () => {
        const mockReservation = { id: 1 }
        const error = new Error('Database error')

        dbGetReservationById.mockResolvedValue(mockReservation)
        dbDeleteReservation.mockRejectedValue(error)

        await expect(reservationService.deleteReservation(1)).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('cancelReservation', () => {
    describe('successful cancellation', () => {
      it('should cancel existing reservation', async () => {
        const mockReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'confirmed'
        }

        const cancelledReservation = {
          id: 1,
          restaurant_id: 1,
          number_of_people: 4,
          status: 'cancelled'
        }

        dbGetReservationById.mockResolvedValue(mockReservation)
        dbCancelReservation.mockResolvedValue(cancelledReservation)

        const result = await reservationService.cancelReservation(1)

        expect(dbGetReservationById).toHaveBeenCalledWith(1)
        expect(dbCancelReservation).toHaveBeenCalledWith(1)
        expect(result).toEqual(cancelledReservation)
      })
    })

    describe('error cases', () => {
      it('should throw error when reservation not found', async () => {
        dbGetReservationById.mockResolvedValue(null)

        await expect(reservationService.cancelReservation(999)).rejects.toThrow(
          'Reservation not found'
        )

        expect(dbCancelReservation).not.toHaveBeenCalled()
      })

      it('should propagate database errors during cancellation', async () => {
        const mockReservation = { id: 1 }
        const error = new Error('Database error')

        dbGetReservationById.mockResolvedValue(mockReservation)
        dbCancelReservation.mockRejectedValue(error)

        await expect(reservationService.cancelReservation(1)).rejects.toThrow(
          'Database error'
        )
      })
    })
  })
})
