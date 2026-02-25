const locationiqValidator = require('../../../src/middlewares/locationiqValidator')
const responseHandler = require('../../../src/utils/responseHandler')

jest.mock('../../../src/utils/responseHandler')

describe('LocationIQ Validator Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateCoordinates', () => {
    describe('valid cases', () => {
      test.each([
        { latitude: 0, longitude: 0 },
        { latitude: -90, longitude: -180 },
        { latitude: 90, longitude: 180 },
        { latitude: 45.123, longitude: 123.456 }
      ])(
        'should validate valid coordinates - latitude: $latitude, longitude: $longitude',
        ({ latitude, longitude }) => {
          expect(() =>
            locationiqValidator.validateCoordinates(latitude, longitude)
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          latitude: 'not-a-number',
          longitude: 0,
          expectedError: 'Latitude and longitude must be numbers'
        },
        {
          latitude: 0,
          longitude: 'not-a-number',
          expectedError: 'Latitude and longitude must be numbers'
        },
        {
          latitude: -91,
          longitude: 0,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: 91,
          longitude: 0,
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          latitude: 0,
          longitude: -181,
          expectedError: 'Longitude must be between -180 and 180'
        },
        {
          latitude: 0,
          longitude: 181,
          expectedError: 'Longitude must be between -180 and 180'
        }
      ])(
        'should throw error for invalid coordinates - latitude: $latitude, longitude: $longitude',
        ({ latitude, longitude, expectedError }) => {
          expect(() =>
            locationiqValidator.validateCoordinates(latitude, longitude)
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateSearchRadius', () => {
    describe('valid cases', () => {
      test.each([
        { radiusMeters: 1 },
        { radiusMeters: 100 },
        { radiusMeters: 1000 },
        { radiusMeters: 50000 },
        { radiusMeters: 1.5 }
      ])(
        'should validate valid radius - radiusMeters: $radiusMeters',
        ({ radiusMeters }) => {
          expect(() =>
            locationiqValidator.validateSearchRadius(radiusMeters)
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          radiusMeters: 'not-a-number',
          expectedError: 'Radius must be a positive number greater than 0 meters'
        },
        {
          radiusMeters: 0,
          expectedError: 'Radius must be a positive number greater than 0 meters'
        },
        {
          radiusMeters: -100,
          expectedError: 'Radius must be a positive number greater than 0 meters'
        },
        { radiusMeters: null, expectedError: 'Radius must be a positive number greater than 0 meters' }
      ])(
        'should throw error for invalid radius - radiusMeters: $radiusMeters',
        ({ radiusMeters, expectedError }) => {
          expect(() =>
            locationiqValidator.validateSearchRadius(radiusMeters)
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateNearbySearchParams', () => {
    describe('valid cases', () => {
      test.each([
        {
          latitude: 0,
          longitude: 0,
          radiusMeters: 1000,
          amenity: 'restaurant'
        },
        {
          latitude: -23.5505,
          longitude: -46.6333,
          radiusMeters: 500,
          amenity: 'cafe'
        },
        {
          latitude: 90,
          longitude: 180,
          radiusMeters: 10000,
          amenity: 'hotel'
        }
      ])(
        'should validate valid nearby search params - latitude: $latitude, longitude: $longitude, radius: $radiusMeters, amenity: $amenity',
        ({ latitude, longitude, radiusMeters, amenity }) => {
          expect(() =>
            locationiqValidator.validateNearbySearchParams(
              latitude,
              longitude,
              radiusMeters,
              amenity
            )
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          latitude: 'invalid',
          longitude: 0,
          radiusMeters: 1000,
          amenity: 'restaurant',
          expectedError: 'Latitude and longitude must be numbers'
        },
        {
          latitude: 0,
          longitude: 'invalid',
          radiusMeters: 1000,
          amenity: 'restaurant',
          expectedError: 'Latitude and longitude must be numbers'
        },
        {
          latitude: 0,
          longitude: 0,
          radiusMeters: -100,
          amenity: 'restaurant',
          expectedError: 'Radius must be a positive number greater than 0 meters'
        },
        {
          latitude: 0,
          longitude: 0,
          radiusMeters: 1000,
          amenity: '',
          expectedError: 'Amenity must be a non-empty string'
        },
        {
          latitude: 0,
          longitude: 0,
          radiusMeters: 1000,
          amenity: null,
          expectedError: 'Amenity must be a non-empty string'
        }
      ])(
        'should throw error - latitude: $latitude, longitude: $longitude, radius: $radiusMeters, amenity: $amenity',
        ({ latitude, longitude, radiusMeters, amenity, expectedError }) => {
          expect(() =>
            locationiqValidator.validateNearbySearchParams(
              latitude,
              longitude,
              radiusMeters,
              amenity
            )
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateAddress', () => {
    describe('valid cases', () => {
      test.each([
        { address: 'New York' },
        { address: 'São Paulo' },
        { address: '123 Main Street' },
        { address: '   Address with spaces   ' }
      ])(
        "should validate valid address - address: '$address'",
        ({ address }) => {
          expect(() =>
            locationiqValidator.validateAddress(address)
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          address: '',
          expectedError: 'Address must be a non-empty string'
        },
        {
          address: null,
          expectedError: 'Address must be a non-empty string'
        },
        {
          address: 123,
          expectedError: 'Address must be a non-empty string'
        },
        {
          address: '   ',
          expectedError: 'Address cannot be empty or whitespace only'
        }
      ])(
        'should throw error for invalid address - address: $address',
        ({ address, expectedError }) => {
          expect(() =>
            locationiqValidator.validateAddress(address)
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateNearbySearchParamsMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        query: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test.each([
        {
          latitude: '0',
          longitude: '0',
          radius: '1000',
          amenity: 'restaurant'
        },
        {
          latitude: '-23.5505',
          longitude: '-46.6333',
          radius: '500',
          amenity: 'cafe'
        },
        {
          latitude: '90',
          longitude: '180',
          amenity: 'hotel'
        }
      ])(
        'should call next() for valid params - latitude: $latitude, longitude: $longitude, radius: $radius, amenity: $amenity',
        ({ latitude, longitude, radius, amenity }) => {
          req.query = { latitude, longitude, radius, amenity }

          locationiqValidator.validateNearbySearchParamsMiddleware(req, res, next)

          expect(next).toHaveBeenCalled()
          expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          query: { longitude: '0', radius: '1000', amenity: 'restaurant' },
          description: 'missing latitude',
          expectedErrorMessage: 'Latitude and longitude are required query parameters'
        },
        {
          query: { latitude: '0', radius: '1000', amenity: 'restaurant' },
          description: 'missing longitude',
          expectedErrorMessage: 'Latitude and longitude are required query parameters'
        },
        {
          query: {
            latitude: '91',
            longitude: '0',
            radius: '1000',
            amenity: 'restaurant'
          },
          description: 'latitude out of range',
          expectedErrorMessage: 'Latitude must be between -90 and 90'
        },
        {
          query: {
            latitude: '0',
            longitude: '181',
            radius: '1000',
            amenity: 'restaurant'
          },
          description: 'longitude out of range',
          expectedErrorMessage: 'Longitude must be between -180 and 180'
        },
        {
          query: {
            latitude: '0',
            longitude: '0',
            radius: '-100',
            amenity: 'restaurant'
          },
          description: 'negative radius',
          expectedErrorMessage: 'Radius must be a positive number greater than 0 meters'
        }
      ])(
        'should call sendValidationError for invalid params - $description',
        ({ query, _description, expectedErrorMessage }) => {
          req.query = query

          const expectedTest = {
            sendValidationErrorParams: [res, expectedErrorMessage]
          }

          locationiqValidator.validateNearbySearchParamsMiddleware(req, res, next)

          expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
            ...expectedTest.sendValidationErrorParams
          )
          expect(next).not.toHaveBeenCalled()
        }
      )
    })

    describe('default values', () => {
      test('should use default radius of 1000 when not provided', () => {
        req.query = { latitude: '0', longitude: '0', amenity: 'restaurant' }

        locationiqValidator.validateNearbySearchParamsMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })

      test("should use default amenity of 'restaurant' when not provided", () => {
        req.query = { latitude: '0', longitude: '0', radius: '1000' }

        locationiqValidator.validateNearbySearchParamsMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })
    })
  })
})
