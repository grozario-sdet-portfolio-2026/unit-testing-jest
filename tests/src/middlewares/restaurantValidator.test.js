const {
  validateCreateRestaurant,
  validateCreateRestaurantMiddleware,
  validateCapacity,
  validateLatitude,
  validateLongitude,
  validateUpdateRestaurant,
  validateUpdateRestaurantMiddleware
} = require('../../../src/middlewares/restaurantValidator')
const responseHandler = require('../../../src/utils/responseHandler')

jest.mock('../../../src/utils/responseHandler')

describe('Restaurant Validator Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateCapacity', () => {
    describe('valid cases', () => {
      test.each([
        { capacity: 1 },
        { capacity: 10 },
        { capacity: 50 },
        { capacity: 100 },
        { capacity: 1000 }
      ])(
        'should validate valid capacity - capacity: $capacity',
        ({ capacity }) => {
          expect(() => validateCapacity(capacity)).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          capacity: 0,
          expectedError: 'Capacity must be between 1 and 9007199254740991'
        },
        {
          capacity: -1,
          expectedError: 'Capacity must be between 1 and 9007199254740991'
        },
        {
          capacity: -100,
          expectedError: 'Capacity must be between 1 and 9007199254740991'
        },
        {
          capacity: 'not-a-number',
          expectedError: 'Capacity must be a number'
        },
        {
          capacity: null,
          expectedError: 'Capacity must be a number'
        },
        {
          capacity: undefined,
          expectedError: 'Capacity must be a number'
        }
      ])(
        'should throw error for invalid capacity - capacity: $capacity',
        ({ capacity, expectedError }) => {
          expect(() => validateCapacity(capacity)).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateLatitude', () => {
    describe('valid cases', () => {
      test.each([
        { latitude: 0 },
        { latitude: -90 },
        { latitude: 90 },
        { latitude: 45.5 },
        { latitude: -23.5505 }
      ])(
        'should validate valid latitude - latitude: $latitude',
        ({ latitude }) => {
          expect(() => validateLatitude(latitude)).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          latitude: -91,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: 91,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: -180,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: 180,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: 'not-a-number',
          expectedError: 'Latitude must be a number'
        },
        {
          latitude: null,
          expectedError: 'Latitude must be a number'
        },
        {
          latitude: undefined,
          expectedError: 'Latitude must be a number'
        }
      ])(
        'should throw error for invalid latitude - latitude: $latitude',
        ({ latitude, expectedError }) => {
          expect(() => validateLatitude(latitude)).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateLongitude', () => {
    describe('valid cases', () => {
      test.each([
        { longitude: 0 },
        { longitude: -180 },
        { longitude: 180 },
        { longitude: 45.5 },
        { longitude: -46.6333 }
      ])(
        'should validate valid longitude - longitude: $longitude',
        ({ longitude }) => {
          expect(() => validateLongitude(longitude)).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          longitude: -181,
          expectedError: 'Longitude must be between -180 and 180'
        },
        {
          longitude: 181,
          expectedError: 'Longitude must be between -180 and 180'
        },
        {
          longitude: -270,
          expectedError: 'Longitude must be between -180 and 180'
        },
        {
          longitude: 270,
          expectedError: 'Longitude must be between -180 and 180'
        },
        {
          longitude: 'not-a-number',
          expectedError: 'Longitude must be a number'
        },
        {
          longitude: null,
          expectedError: 'Longitude must be a number'
        },
        {
          longitude: undefined,
          expectedError: 'Longitude must be a number'
        }
      ])(
        'should throw error for invalid longitude - longitude: $longitude',
        ({ longitude, expectedError }) => {
          expect(() => validateLongitude(longitude)).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateCreateRestaurant', () => {
    describe('valid cases', () => {
      test('should validate complete restaurant data', () => {
        const validRestaurant = {
          name: 'Italian Pizzaria',
          address: '123 Main Street',
          capacity: 50
        }

        expect(() =>
          validateCreateRestaurant(validRestaurant)
        ).not.toThrow()
      })

      test('should validate restaurant with coordinates', () => {
        const validRestaurant = {
          name: 'Sushi Bar',
          address: '456 Park Avenue',
          capacity: 100,
          latitude: 35.6762,
          longitude: 139.6503
        }

        expect(() =>
          validateCreateRestaurant(validRestaurant)
        ).not.toThrow()
      })

      test.each([
        {
          name: 'Restaurant 1',
          address: 'Address 1',
          capacity: 25
        },
        {
          name: 'Restaurant 2',
          address: '123 Oak Street',
          capacity: 75,
          latitude: 40.7128,
          longitude: -74.006
        }
      ])(
        'should validate various valid restaurants',
        (validRestaurant) => {
          expect(() =>
            validateCreateRestaurant(validRestaurant)
          ).not.toThrow()
        }
      )
    })

    describe('error cases - missing fields', () => {
      test.each([
        {
          restaurantData: {
            address: '123 Main Street',
            capacity: 50
          },
          description: 'missing name'
        },
        {
          restaurantData: {
            name: 'Italian Pizzaria',
            capacity: 50
          },
          description: 'missing address'
        },
        {
          restaurantData: {
            name: 'Italian Pizzaria',
            address: '123 Main Street'
          },
          description: 'missing capacity'
        }
      ])(
        'should throw error - $description',
        ({ restaurantData, _description }) => {
          expect(() =>
            validateCreateRestaurant(restaurantData)
          ).toThrow('Missing required fields: name, address, capacity')
        }
      )
    })

    describe('error cases - invalid capacity', () => {
      test('should throw error for invalid capacity', () => {
        const invalidRestaurant = {
          name: 'Restaurant',
          address: '123 Main Street',
          capacity: 0
        }

        expect(() =>
          validateCreateRestaurant(invalidRestaurant)
        ).toThrow('Capacity must be between 1 and 9007199254740991')
      })
    })

    describe('error cases - invalid coordinates', () => {
      test('should throw error for invalid latitude', () => {
        const invalidRestaurant = {
          name: 'Restaurant',
          address: '123 Main Street',
          capacity: 50,
          latitude: 91
        }

        expect(() =>
          validateCreateRestaurant(invalidRestaurant)
        ).toThrow('Latitude must be between -90 and 90')
      })

      test('should throw error for invalid longitude', () => {
        const invalidRestaurant = {
          name: 'Restaurant',
          address: '123 Main Street',
          capacity: 50,
          longitude: 181
        }

        expect(() =>
          validateCreateRestaurant(invalidRestaurant)
        ).toThrow('Longitude must be between -180 and 180')
      })
    })
  })

  describe('validateUpdateRestaurant', () => {
    describe('valid cases', () => {
      test('should validate updating capacity', () => {
        const updateData = { capacity: 75 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })

      test('should validate updating latitude', () => {
        const updateData = { latitude: 45.5 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })

      test('should validate updating longitude', () => {
        const updateData = { longitude: 120 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })

      test('should validate updating multiple fields', () => {
        const updateData = {
          capacity: 100,
          latitude: 35.6762,
          longitude: 139.6503
        }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })

      test('should validate empty update', () => {
        const updateData = {}

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })

      test('should validate update with undefined coordinates (optional)', () => {
        const updateData = {
          capacity: 50,
          latitude: undefined,
          longitude: null
        }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).not.toThrow()
      })
    })

    describe('error cases', () => {
      test('should throw error for invalid capacity in update', () => {
        const updateData = { capacity: -10 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).toThrow('Capacity must be between 1 and 9007199254740991')
      })

      test('should throw error for invalid latitude in update', () => {
        const updateData = { latitude: -91 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).toThrow('Latitude must be between -90 and 90')
      })

      test('should throw error for invalid longitude in update', () => {
        const updateData = { longitude: 200 }

        expect(() =>
          validateUpdateRestaurant(updateData)
        ).toThrow('Longitude must be between -180 and 180')
      })
    })
  })

  describe('validateCreateRestaurantMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        body: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test('should call next() for valid restaurant data', () => {
        req.body = {
          name: 'Italian Pizzaria',
          address: '123 Main Street',
          capacity: 50
        }

        validateCreateRestaurantMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })

      test('should call next() for restaurant with coordinates', () => {
        req.body = {
          name: 'Sushi Bar',
          address: '456 Park Avenue',
          capacity: 100,
          latitude: 35.6762,
          longitude: 139.6503
        }

        validateCreateRestaurantMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error cases', () => {
      test('should call sendValidationError for missing required fields', () => {
        req.body = {
          name: 'Italian Pizzaria',
          address: '123 Main Street'
        }

        validateCreateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Missing required fields: name, address, capacity'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for invalid capacity', () => {
        req.body = {
          name: 'Restaurant',
          address: '123 Main Street',
          capacity: 0
        }

        validateCreateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Capacity must be between 1 and 9007199254740991'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for invalid latitude', () => {
        req.body = {
          name: 'Restaurant',
          address: '123 Main Street',
          capacity: 50,
          latitude: 95
        }

        validateCreateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Latitude must be between -90 and 90'
        )
        expect(next).not.toHaveBeenCalled()
      })
    })
  })

  describe('validateUpdateRestaurantMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        body: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test('should call next() for valid update data', () => {
        req.body = { capacity: 75 }

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })

      test('should call next() for empty update body', () => {
        req.body = {}

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })

      test('should call next() for update with multiple valid fields', () => {
        req.body = {
          capacity: 100,
          latitude: 40.7128,
          longitude: -74.006
        }

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error cases', () => {
      test('should call sendValidationError for invalid capacity', () => {
        req.body = { capacity: -50 }

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Capacity must be between 1 and 9007199254740991'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for invalid latitude', () => {
        req.body = { latitude: 100 }

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Latitude must be between -90 and 90'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for invalid longitude', () => {
        req.body = { longitude: -200 }

        validateUpdateRestaurantMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Longitude must be between -180 and 180'
        )
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
