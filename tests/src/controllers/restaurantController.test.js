const restaurantService = require('../../../src/services/restaurantService')
const restaurantController = require('../../../src/controllers/restaurantController')
const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  ERROR_RESTAURANT_NOT_FOUND,
  SUCCESS_RESTAURANT_CREATED,
  SUCCESS_RESTAURANT_UPDATED,
  SUCCESS_RESTAURANT_DELETED
} = require('../../../src/constants')

const {
  sendSuccess,
  sendError,
  sendValidationError
} = require('../../../src/utils/responseHandler')

jest.mock('../../../src/services/restaurantService', () => ({
  getAllRestaurants: jest.fn(),
  createRestaurant: jest.fn(),
  getRestaurantById: jest.fn(),
  updateRestaurant: jest.fn(),
  deleteRestaurant: jest.fn(),
  searchNearbyRestaurants: jest.fn()
}))
jest.mock('../../../src/utils/responseHandler')
jest.mock('../../../src/constants', () => ({
  HTTP_STATUS_OK: 200,
  HTTP_STATUS_CREATED: 201,
  ERROR_RESTAURANT_NOT_FOUND: 'test Restaurant not found',
  SUCCESS_RESTAURANT_CREATED: 'test Restaurant created successfully',
  SUCCESS_RESTAURANT_UPDATED: 'test Restaurant updated successfully',
  SUCCESS_RESTAURANT_DELETED: 'test Restaurant deleted successfully'
}))

describe('Restaurant Controller', () => {
  let req, res

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {}
    }
    res = {
      status: jest.fn().mockReturnValue({
        json: jest.fn()
      }),
      json: jest.fn()
    }

    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('getAllRestaurants', () => {
    describe('successfully get restaurants', () => {
      it('should retrieve all restaurants and send success response', async () => {
        const mockRestaurants = [
          { id: 1, name: 'Restaurant 1', capacity: 50 },
          { id: 2, name: 'Restaurant 2', capacity: 100 }
        ]
        restaurantService.getAllRestaurants.mockResolvedValue(mockRestaurants)

        const expectedTest = {
          getAllRestaurantsResult: mockRestaurants,
          sendSuccessParams: [res, HTTP_STATUS_OK, mockRestaurants]
        }

        await restaurantController.getAllRestaurants(req, res)

        expect(restaurantService.getAllRestaurants).toHaveBeenCalled()
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while retrieving restaurants', () => {
      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        restaurantService.getAllRestaurants.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.getAllRestaurants(req, res)

        expect(restaurantService.getAllRestaurants).toHaveBeenCalled()
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('createRestaurant', () => {
    describe('successfully create restaurant', () => {
      it('should create a restaurant and send success response', async () => {
        const restaurantData = {
          name: 'New Restaurant',
          capacity: 50,
          address: '123 Main St'
        }
        const createdRestaurant = { id: 1, ...restaurantData }
        req.body = restaurantData
        restaurantService.createRestaurant.mockResolvedValue(
          createdRestaurant
        )

        const expectedTest = {
          createRestaurantResult: createdRestaurant,
          createRestaurantParam: restaurantData,
          sendSuccessParams: [
            res,
            HTTP_STATUS_CREATED,
            createdRestaurant,
            SUCCESS_RESTAURANT_CREATED
          ]
        }

        await restaurantController.createRestaurant(req, res)

        expect(restaurantService.createRestaurant).toHaveBeenCalledWith(
          expectedTest.createRestaurantParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while creating restaurant', () => {
      it('should handle validation errors and send validation error response', async () => {
        const error = new Error('Invalid data')
        restaurantService.createRestaurant.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.createRestaurant(req, res)

        expect(restaurantService.createRestaurant).toHaveBeenCalled()
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('getRestaurantById', () => {
    describe('successfully get restaurant by ID', () => {
      it('should retrieve a restaurant by ID and send success response', async () => {
        const restaurant = {
          id: 1,
          name: 'Restaurant 1',
          capacity: 50
        }
        req.params.id = 1
        restaurantService.getRestaurantById.mockResolvedValue(restaurant)

        const expectedTest = {
          getRestaurantByIdResult: restaurant,
          getRestaurantByIdParam: req.params.id,
          sendSuccessParams: [res, HTTP_STATUS_OK, restaurant]
        }

        await restaurantController.getRestaurantById(req, res)

        expect(restaurantService.getRestaurantById).toHaveBeenCalledWith(
          expectedTest.getRestaurantByIdParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while retrieving restaurant', () => {
      it('should send 404 error when restaurant not found', async () => {
        req.params.id = 999
        restaurantService.getRestaurantById.mockResolvedValue(null)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESTAURANT_NOT_FOUND]
        }

        await restaurantController.getRestaurantById(req, res)

        expect(restaurantService.getRestaurantById).toHaveBeenCalledWith(999)
        expect(sendError).toHaveBeenCalledWith(...expectedTest.sendErrorParams)
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        req.params.id = 1
        restaurantService.getRestaurantById.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.getRestaurantById(req, res)

        expect(restaurantService.getRestaurantById).toHaveBeenCalledWith(1)
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('updateRestaurant', () => {
    describe('successfully update restaurant', () => {
      it('should update a restaurant and send success response', async () => {
        const updateData = { name: 'Updated Name' }
        const updatedRestaurant = {
          id: 1,
          name: 'Updated Name',
          capacity: 50
        }
        req.params.id = 1
        req.body = updateData
        restaurantService.updateRestaurant.mockResolvedValue(
          updatedRestaurant
        )

        const expectedTest = {
          updateRestaurantResult: updatedRestaurant,
          updateRestaurantParams: [req.params.id, updateData],
          sendSuccessParams: [
            res,
            HTTP_STATUS_OK,
            updatedRestaurant,
            SUCCESS_RESTAURANT_UPDATED
          ]
        }

        await restaurantController.updateRestaurant(req, res)

        expect(restaurantService.updateRestaurant).toHaveBeenCalledWith(
          ...expectedTest.updateRestaurantParams
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while updating restaurant', () => {
      it('should send 404 error when restaurant not found', async () => {
        const error = new Error('Restaurant not found')
        req.params.id = 999
        restaurantService.updateRestaurant.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESTAURANT_NOT_FOUND]
        }

        await restaurantController.updateRestaurant(req, res)

        expect(sendError).toHaveBeenCalledWith(...expectedTest.sendErrorParams)
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle validation errors and send validation error response', async () => {
        const error = new Error('Invalid data')
        req.params.id = 1
        restaurantService.updateRestaurant.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.updateRestaurant(req, res)

        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('deleteRestaurant', () => {
    describe('successfully delete restaurant', () => {
      it('should delete a restaurant and send success response', async () => {
        const result = { success: true }
        req.params.id = 1
        restaurantService.deleteRestaurant.mockResolvedValue(result)

        const expectedTest = {
          deleteRestaurantResult: result,
          deleteRestaurantParam: req.params.id,
          sendSuccessParams: [
            res,
            HTTP_STATUS_OK,
            result,
            SUCCESS_RESTAURANT_DELETED
          ]
        }

        await restaurantController.deleteRestaurant(req, res)

        expect(restaurantService.deleteRestaurant).toHaveBeenCalledWith(
          expectedTest.deleteRestaurantParam
        )
        expect(sendSuccess).toHaveBeenCalledWith(
          ...expectedTest.sendSuccessParams
        )
        expect(sendValidationError).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })

    describe('error occurs while deleting restaurant', () => {
      it('should send 404 error when restaurant not found', async () => {
        const error = new Error('Restaurant not found')
        req.params.id = 999
        restaurantService.deleteRestaurant.mockRejectedValue(error)

        const expectedTest = {
          sendErrorParams: [res, 404, ERROR_RESTAURANT_NOT_FOUND]
        }

        await restaurantController.deleteRestaurant(req, res)

        expect(sendError).toHaveBeenCalledWith(...expectedTest.sendErrorParams)
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should handle errors and send validation error response', async () => {
        const error = new Error('Database error')
        req.params.id = 1
        restaurantService.deleteRestaurant.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.deleteRestaurant(req, res)

        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(sendSuccess).not.toHaveBeenCalled()
        expect(sendError).not.toHaveBeenCalled()
      })
    })
  })

  describe('searchNearbyRestaurants', () => {
    describe('successfully search nearby restaurants', () => {
      it('should search nearby restaurants and send success response', async () => {
        const searchResult = {
          success: true,
          data: [
            { id: 1, name: 'Near Restaurant', distance: 500 }
          ],
          count: 1,
          searchParams: {
            latitude: 40.7128,
            longitude: -74.0060,
            radiusMeters: 1000,
            amenity: 'restaurant'
          }
        }
        req.query = {
          latitude: '40.7128',
          longitude: '-74.0060',
          radius: '1000',
          amenity: 'restaurant'
        }
        restaurantService.searchNearbyRestaurants.mockResolvedValue(
          searchResult
        )

        const expectedTest = {
          searchNearbyRestaurantsResult: searchResult,
          searchNearbyRestaurantsParams: [
            '40.7128',
            '-74.0060',
            '1000',
            'restaurant'
          ],
          jsonParams: searchResult
        }

        // Setup the mock chain correctly
        const jsonMock = jest.fn()
        res.status.mockReturnValue({ json: jsonMock })

        await restaurantController.searchNearbyRestaurants(req, res)

        expect(restaurantService.searchNearbyRestaurants).toHaveBeenCalledWith(
          ...expectedTest.searchNearbyRestaurantsParams
        )
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK)
        expect(jsonMock).toHaveBeenCalledWith(expectedTest.jsonParams)
        expect(sendValidationError).not.toHaveBeenCalled()
      })

      it('should use default values for radius and amenity', async () => {
        const searchResult = {
          success: true,
          data: [],
          count: 0,
          searchParams: {
            latitude: 40.7128,
            longitude: -74.0060,
            radiusMeters: 1000,
            amenity: 'restaurant'
          }
        }
        req.query = {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
        restaurantService.searchNearbyRestaurants.mockResolvedValue(
          searchResult
        )

        const expectedTest = {
          searchNearbyRestaurantsParams: [
            '40.7128',
            '-74.0060',
            1000,
            'restaurant'
          ]
        }

        // Setup the mock chain correctly
        const jsonMock = jest.fn()
        res.status.mockReturnValue({ json: jsonMock })

        await restaurantController.searchNearbyRestaurants(req, res)

        expect(restaurantService.searchNearbyRestaurants).toHaveBeenCalledWith(
          ...expectedTest.searchNearbyRestaurantsParams
        )
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_OK)
        expect(jsonMock).toHaveBeenCalledWith(searchResult)
      })
    })

    describe('error occurs while searching nearby restaurants', () => {
      it('should handle errors and send validation error response', async () => {
        const error = new Error('API error')
        req.query = {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
        restaurantService.searchNearbyRestaurants.mockRejectedValue(error)

        const expectedTest = {
          sendValidationErrorParams: [res, error.message]
        }

        await restaurantController.searchNearbyRestaurants(req, res)

        expect(restaurantService.searchNearbyRestaurants).toHaveBeenCalled()
        expect(sendValidationError).toHaveBeenCalledWith(
          ...expectedTest.sendValidationErrorParams
        )
        expect(res.json).not.toHaveBeenCalled()
      })
    })
  })
})
