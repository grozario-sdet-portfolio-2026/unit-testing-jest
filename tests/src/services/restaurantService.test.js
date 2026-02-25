const restaurantService = require('../../../src/services/restaurantService')
const locationiqClient = require('../../../src/clients/locationiq')
const locationiqService = require('../../../src/services/locationiqService')
const {
  createRestaurant: dbCreateRestaurant,
  getAllRestaurants: dbGetAllRestaurants,
  getRestaurantById: dbGetRestaurantById,
  updateRestaurant: dbUpdateRestaurant,
  deleteRestaurant: dbDeleteRestaurant
} = require('../../../src/infra/sqlite/database')

jest.mock('../../../src/infra/sqlite/database', () => ({
  createRestaurant: jest.fn(),
  getAllRestaurants: jest.fn(),
  getRestaurantById: jest.fn(),
  updateRestaurant: jest.fn(),
  deleteRestaurant: jest.fn()
}))

jest.mock('../../../src/clients/locationiq', () => ({
  requestNearbySearch: jest.fn()
}))

jest.mock('../../../src/services/locationiqService', () => ({
  buildSearchBoundingBox: jest.fn(),
  processNearbySearchResults: jest.fn()
}))

describe('Restaurant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createRestaurant', () => {
    describe('successful creation', () => {
      it('should create a restaurant with provided data', async () => {
        const restaurantData = {
          name: 'Test Restaurant',
          capacity: 50,
          address: '123 Main Street',
          latitude: 40.7128,
          longitude: -74.006
        }

        const mockCreatedRestaurant = {
          id: 1,
          ...restaurantData
        }

        dbCreateRestaurant.mockResolvedValue(mockCreatedRestaurant)

        const result = await restaurantService.createRestaurant(restaurantData)

        expect(dbCreateRestaurant).toHaveBeenCalledWith(restaurantData)
        expect(result).toEqual(mockCreatedRestaurant)
      })

      it('should return created restaurant with ID', async () => {
        const restaurantData = {
          name: 'Pizza Place',
          capacity: 100,
          address: '456 Oak Ave',
          latitude: 40.8,
          longitude: -74.0
        }

        const mockCreatedRestaurant = {
          id: 42,
          ...restaurantData
        }

        dbCreateRestaurant.mockResolvedValue(mockCreatedRestaurant)

        const result = await restaurantService.createRestaurant(restaurantData)

        expect(result.id).toBe(42)
        expect(result.name).toBe('Pizza Place')
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const restaurantData = { name: 'Restaurant' }
        const error = new Error('Database connection error')

        dbCreateRestaurant.mockRejectedValue(error)

        await expect(
          restaurantService.createRestaurant(restaurantData)
        ).rejects.toThrow('Database connection error')
      })
    })
  })

  describe('getAllRestaurants', () => {
    describe('successful retrieval', () => {
      it('should retrieve all restaurants from database', async () => {
        const mockRestaurants = [
          { id: 1, name: 'Restaurant 1', capacity: 50 },
          { id: 2, name: 'Restaurant 2', capacity: 100 }
        ]

        dbGetAllRestaurants.mockResolvedValue(mockRestaurants)

        const result = await restaurantService.getAllRestaurants()

        expect(dbGetAllRestaurants).toHaveBeenCalled()
        expect(result).toEqual(mockRestaurants)
        expect(result).toHaveLength(2)
      })

      it('should return empty array when no restaurants exist', async () => {
        dbGetAllRestaurants.mockResolvedValue([])

        const result = await restaurantService.getAllRestaurants()

        expect(result).toEqual([])
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const error = new Error('Database error')

        dbGetAllRestaurants.mockRejectedValue(error)

        await expect(restaurantService.getAllRestaurants()).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('getRestaurantById', () => {
    describe('successful retrieval', () => {
      it('should retrieve restaurant by ID', async () => {
        const mockRestaurant = {
          id: 1,
          name: 'Test Restaurant',
          capacity: 50
        }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)

        const result = await restaurantService.getRestaurantById(1)

        expect(dbGetRestaurantById).toHaveBeenCalledWith(1)
        expect(result).toEqual(mockRestaurant)
      })

      it('should return null when restaurant not found', async () => {
        dbGetRestaurantById.mockResolvedValue(null)

        const result = await restaurantService.getRestaurantById(999)

        expect(result).toBeNull()
      })
    })

    describe('error handling', () => {
      it('should propagate database errors', async () => {
        const error = new Error('Database error')

        dbGetRestaurantById.mockRejectedValue(error)

        await expect(restaurantService.getRestaurantById(1)).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('getRestaurantByIdOrThrow', () => {
    describe('successful retrieval', () => {
      it('should return restaurant when found', async () => {
        const mockRestaurant = {
          id: 1,
          name: 'Test Restaurant',
          capacity: 50
        }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)

        const result = await restaurantService.getRestaurantByIdOrThrow(1)

        expect(result).toEqual(mockRestaurant)
      })
    })

    describe('error cases', () => {
      it('should throw error when restaurant not found', async () => {
        dbGetRestaurantById.mockResolvedValue(null)

        await expect(
          restaurantService.getRestaurantByIdOrThrow(999)
        ).rejects.toThrow('Restaurant not found')
      })

      it('should throw error with specific message', async () => {
        dbGetRestaurantById.mockResolvedValue(null)

        await expect(restaurantService.getRestaurantByIdOrThrow(1))
          .rejects
          .toThrow('Restaurant not found')
      })
    })
  })

  describe('mergeRestaurantData', () => {
    describe('data merging', () => {
      it('should merge update data with existing restaurant data', () => {
        const existingRestaurant = {
          id: 1,
          name: 'Original Name',
          capacity: 50,
          address: '123 Main St'
        }

        const updateData = {
          name: 'Updated Name'
        }

        const result = restaurantService.mergeRestaurantData(
          existingRestaurant,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Updated Name',
          capacity: 50,
          address: '123 Main St'
        })
      })

      it('should not override with undefined values', () => {
        const existingRestaurant = {
          name: 'Restaurant',
          capacity: 50,
          address: 'Street'
        }

        const updateData = {
          name: 'New Name',
          capacity: undefined,
          address: null
        }

        const result = restaurantService.mergeRestaurantData(
          existingRestaurant,
          updateData
        )

        expect(result.name).toBe('New Name')
        expect(result.capacity).toBe(50)
        expect(result.address).toBe('Street')
      })

      it('should not modify original objects', () => {
        const existingRestaurant = {
          name: 'Original',
          capacity: 50
        }

        const updateData = {
          name: 'Updated'
        }

        const originalCopy = JSON.parse(JSON.stringify(existingRestaurant))

        restaurantService.mergeRestaurantData(existingRestaurant, updateData)

        expect(existingRestaurant).toEqual(originalCopy)
      })

      it('should handle empty update data', () => {
        const existingRestaurant = {
          name: 'Restaurant',
          capacity: 50
        }

        const result = restaurantService.mergeRestaurantData(
          existingRestaurant,
          {}
        )

        expect(result).toEqual(existingRestaurant)
      })

      it('should add new properties from update data', () => {
        const existingRestaurant = {
          name: 'Restaurant',
          capacity: 50
        }

        const updateData = {
          phone: '123-456-7890',
          email: 'test@test.com'
        }

        const result = restaurantService.mergeRestaurantData(
          existingRestaurant,
          updateData
        )

        expect(result.phone).toBe('123-456-7890')
        expect(result.email).toBe('test@test.com')
      })
    })
  })

  describe('updateRestaurant', () => {
    describe('successful update', () => {
      it('should update restaurant with new data', async () => {
        const existingRestaurant = {
          id: 1,
          name: 'Original Name',
          capacity: 50
        }

        const updateData = {
          name: 'Updated Name'
        }

        const updatedRestaurant = {
          id: 1,
          name: 'Updated Name',
          capacity: 50
        }

        dbGetRestaurantById.mockResolvedValue(existingRestaurant)
        dbUpdateRestaurant.mockResolvedValue(updatedRestaurant)

        const result = await restaurantService.updateRestaurant(1, updateData)

        expect(dbGetRestaurantById).toHaveBeenCalledWith(1)
        expect(dbUpdateRestaurant).toHaveBeenCalledWith(1, updatedRestaurant)
        expect(result).toEqual(updatedRestaurant)
      })

      it('should merge only provided fields during update', async () => {
        const existingRestaurant = {
          id: 1,
          name: 'Restaurant',
          capacity: 50,
          address: '123 St'
        }

        const updateData = {
          capacity: 75
        }

        const expectedMerged = {
          id: 1,
          name: 'Restaurant',
          capacity: 75,
          address: '123 St'
        }

        dbGetRestaurantById.mockResolvedValue(existingRestaurant)
        dbUpdateRestaurant.mockResolvedValue(expectedMerged)

        await restaurantService.updateRestaurant(1, updateData)

        expect(dbUpdateRestaurant).toHaveBeenCalledWith(1, expectedMerged)
      })
    })

    describe('error cases', () => {
      it('should throw error when restaurant not found', async () => {
        const updateData = { name: 'New Name' }

        dbGetRestaurantById.mockResolvedValue(null)

        await expect(
          restaurantService.updateRestaurant(999, updateData)
        ).rejects.toThrow('Restaurant not found')

        expect(dbUpdateRestaurant).not.toHaveBeenCalled()
      })

      it('should propagate database errors', async () => {
        const existingRestaurant = { id: 1, name: 'Restaurant' }
        const updateData = { name: 'Updated' }
        const error = new Error('Database error')

        dbGetRestaurantById.mockResolvedValue(existingRestaurant)
        dbUpdateRestaurant.mockRejectedValue(error)

        await expect(
          restaurantService.updateRestaurant(1, updateData)
        ).rejects.toThrow('Database error')
      })
    })
  })

  describe('deleteRestaurant', () => {
    describe('successful deletion', () => {
      it('should delete existing restaurant', async () => {
        const mockRestaurant = {
          id: 1,
          name: 'Test Restaurant'
        }

        const deletionResult = { success: true }

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        dbDeleteRestaurant.mockResolvedValue(deletionResult)

        const result = await restaurantService.deleteRestaurant(1)

        expect(dbGetRestaurantById).toHaveBeenCalledWith(1)
        expect(dbDeleteRestaurant).toHaveBeenCalledWith(1)
        expect(result).toEqual(deletionResult)
      })
    })

    describe('error cases', () => {
      it('should throw error when restaurant not found', async () => {
        dbGetRestaurantById.mockResolvedValue(null)

        await expect(restaurantService.deleteRestaurant(999)).rejects.toThrow(
          'Restaurant not found'
        )

        expect(dbDeleteRestaurant).not.toHaveBeenCalled()
      })

      it('should propagate database errors during deletion', async () => {
        const mockRestaurant = { id: 1 }
        const error = new Error('Database error')

        dbGetRestaurantById.mockResolvedValue(mockRestaurant)
        dbDeleteRestaurant.mockRejectedValue(error)

        await expect(restaurantService.deleteRestaurant(1)).rejects.toThrow(
          'Database error'
        )
      })
    })
  })

  describe('searchNearbyRestaurants', () => {
    describe('successful search', () => {
      it('should search nearby restaurants and return formatted results', async () => {
        const latitude = '40.7128'
        const longitude = '-74.006'
        const radiusMeters = '5000'
        const amenity = 'restaurant'

        const mockApiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant 1',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const mockProcessedResults = [
          {
            id: 1,
            name: 'Restaurant 1',
            distanceKilometers: 0
          }
        ]

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue(mockApiResults)
        locationiqService.processNearbySearchResults.mockReturnValue(
          mockProcessedResults
        )

        const result = await restaurantService.searchNearbyRestaurants(
          latitude,
          longitude,
          radiusMeters,
          amenity
        )

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProcessedResults)
        expect(result.count).toBe(1)
        expect(result.searchParams).toEqual({
          latitude: 40.7128,
          longitude: -74.006,
          radiusMeters: 5000,
          amenity: 'restaurant'
        })
      })

      it('should parse string parameters to correct types', async () => {
        const latitude = '40.7128'
        const longitude = '-74.006'
        const radiusMeters = '10000'
        const amenity = 'cafe'

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        await restaurantService.searchNearbyRestaurants(
          latitude,
          longitude,
          radiusMeters,
          amenity
        )

        expect(locationiqService.buildSearchBoundingBox).toHaveBeenCalledWith(
          40.7128,
          -74.006,
          10
        )
      })

      it('should use correct OSM tag query format', async () => {
        const amenity = 'restaurant'

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        await restaurantService.searchNearbyRestaurants(
          '40.7128',
          '-74.006',
          '5000',
          amenity
        )

        const osmTagQuery = '[amenity=restaurant]'
        expect(locationiqClient.requestNearbySearch).toHaveBeenCalledWith(
          osmTagQuery,
          expect.any(String),
          expect.any(Number)
        )
      })

      it('should return empty data array when no restaurants found', async () => {
        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        const result = await restaurantService.searchNearbyRestaurants(
          '40.7128',
          '-74.006',
          '5000',
          'restaurant'
        )

        expect(result.data).toEqual([])
        expect(result.count).toBe(0)
      })

      it('should handle different amenity types', async () => {
        const amenities = ['restaurant', 'cafe', 'bar', 'pub']

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        for (const amenity of amenities) {
          await restaurantService.searchNearbyRestaurants(
            '40.7128',
            '-74.006',
            '5000',
            amenity
          )

          expect(locationiqClient.requestNearbySearch).toHaveBeenCalledWith(
            expect.stringContaining(amenity),
            expect.any(String),
            expect.any(Number)
          )
        }
      })

      it('should include search parameters in response', async () => {
        const latitude = '40.7128'
        const longitude = '-74.006'
        const radiusMeters = '15000'
        const amenity = 'restaurant'

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        const result = await restaurantService.searchNearbyRestaurants(
          latitude,
          longitude,
          radiusMeters,
          amenity
        )

        expect(result.searchParams.latitude).toBe(40.7128)
        expect(result.searchParams.longitude).toBe(-74.006)
        expect(result.searchParams.radiusMeters).toBe(15000)
        expect(result.searchParams.amenity).toBe('restaurant')
      })
    })

    describe('error handling', () => {
      it('should propagate LocationIQ API errors', async () => {
        const error = new Error('LocationIQ API error')

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockRejectedValue(error)

        await expect(
          restaurantService.searchNearbyRestaurants(
            '40.7128',
            '-74.006',
            '5000',
            'restaurant'
          )
        ).rejects.toThrow('LocationIQ API error')
      })

      it('should handle negative radius conversion', async () => {
        const latitude = '40.7128'
        const longitude = '-74.006'
        const radiusMeters = '5000'
        const amenity = 'restaurant'

        locationiqService.buildSearchBoundingBox.mockReturnValue(
          '0,0,1,1'
        )
        locationiqClient.requestNearbySearch.mockResolvedValue([])
        locationiqService.processNearbySearchResults.mockReturnValue([])

        await restaurantService.searchNearbyRestaurants(
          latitude,
          longitude,
          radiusMeters,
          amenity
        )

        // Should convert 5000 meters to 5 kilometers
        expect(locationiqService.buildSearchBoundingBox).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          5
        )
      })
    })
  })
})
