jest.mock('axios', () => ({
  get: jest.fn()
}))

jest.mock('../../../src/utils/errorHandler', () => ({
  handleExternalApiError: jest.fn()
}))

const DEFAULT_CONSTANTS = {
  LOCATION_IQ_BASE_URL: 'https://api.locationiq.com/v1',
  LOCATION_IQ_API_TIMEOUT_MS: 5000,
  LOCATION_IQ_BOUNDED_SEARCH_ENABLED: true
}

describe('LocationIQ client', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('API Key Configuration Warning', () => {
    test('should warn when LOCATION_IQ_API_KEY is not configured', () => {
      jest.doMock('../../../src/constants', () => ({
        ...DEFAULT_CONSTANTS,
        LOCATION_IQ_API_KEY: undefined
      }))

      const logger = require('../../../src/utils/logger')
      const warnSpy = jest.spyOn(logger, 'warn')

      require('../../../src/clients/locationiq')

      expect(warnSpy).toHaveBeenCalledWith(
        'LocationIQ API key is not configured. Some features may not work.'
      )
    })

    test('should not warn when LOCATION_IQ_API_KEY is configured', () => {
      jest.doMock('../../../src/constants', () => ({
        ...DEFAULT_CONSTANTS,
        LOCATION_IQ_API_KEY: 'test-api-key'
      }))

      const logger = require('../../../src/utils/logger')
      const warnSpy = jest.spyOn(logger, 'warn')

      require('../../../src/clients/locationiq')

      expect(warnSpy).not.toHaveBeenCalled()
    })
  })

  describe('functions', () => {
    describe('requestNearbySearch', () => {
      const TEST_API_KEY = 'test-api-key'
      const TEST_QUERY = '[amenity=restaurant]'
      const TEST_VIEWBOX = '0,0,1,1'
      const TEST_LIMIT = 10
      const API_ENDPOINT = 'https://api.locationiq.com/v1/search.php'
      const API_TIMEOUT = 5000
      const API_FORMAT = 'json'
      const ERROR_TYPE = 'nearby_search'

      let axios
      let logger
      let requestNearbySearch

      beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()

        jest.doMock('../../../src/constants', () => ({
          ...DEFAULT_CONSTANTS,
          LOCATION_IQ_API_KEY: TEST_API_KEY
        }))

        jest.doMock('../../../src/utils/errorHandler', () => ({
          handleExternalApiError: jest.fn()
        }))

        jest.doMock('../../../src/utils/logger', () => ({
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn()
        }))

        axios = require('axios')
        logger = require('../../../src/utils/logger')
        requestNearbySearch =
          require('../../../src/clients/locationiq').requestNearbySearch
      })

      describe('successful API call', () => {
        test.each([
          {
            mockData: [{ id: '1', name: 'Test Place' }],
            expectedResult: [{ id: '1', name: 'Test Place' }],
            expectedResultCount: 1
          },
          { mockData: undefined, expectedResult: [], expectedResultCount: 0 }
        ])(
          'should make correct API call and return data',
          async ({ mockData, expectedResult, expectedResultCount }) => {
            axios.get.mockResolvedValue({ data: mockData })

            const result = await requestNearbySearch(
              TEST_QUERY,
              TEST_VIEWBOX,
              TEST_LIMIT
            )

            const expectedTest = {
              axiosGetParams: [
                API_ENDPOINT,
                {
                  params: {
                    key: TEST_API_KEY,
                    q: TEST_QUERY,
                    format: API_FORMAT,
                    limit: TEST_LIMIT,
                    bounded: true,
                    viewbox: TEST_VIEWBOX
                  },
                  timeout: API_TIMEOUT
                }
              ],
              debugLogs: {
                firstCall: [
                  'LocationIQ nearby search request',
                  { osmTagQuery: TEST_QUERY, boundingBox: TEST_VIEWBOX }
                ],
                secondCall: [
                  'LocationIQ nearby search success',
                  { resultCount: expectedResultCount }
                ]
              },
              requestNearbySearchResult: expectedResult
            }

            expect(axios.get).toHaveBeenCalledWith(
              ...expectedTest.axiosGetParams
            )

            expect(logger.debug).toHaveBeenCalledTimes(2)
            expect(logger.debug).toHaveBeenNthCalledWith(
              1,
              ...expectedTest.debugLogs.firstCall
            )
            expect(logger.debug).toHaveBeenNthCalledWith(
              2,
              ...expectedTest.debugLogs.secondCall
            )

            expect(result).toEqual(expectedTest.requestNearbySearchResult)
          }
        )
      })

      describe('API call failure', () => {
        test('should handle API errors properly', async () => {
          const error = new Error('API Error')
          const errorHandlerMocked = require('../../../src/utils/errorHandler')

          axios.get.mockImplementation(() => {
            throw error
          })

          const expectedTest = {
            handleExternalApiErrorParams: [
              error,
              ERROR_TYPE,
              { timeout: API_TIMEOUT }
            ]
          }

          await requestNearbySearch(TEST_QUERY, TEST_VIEWBOX, TEST_LIMIT)

          expect(
            errorHandlerMocked.handleExternalApiError
          ).toHaveBeenCalledWith(...expectedTest.handleExternalApiErrorParams)
        })
      })
    })

    describe('requestForwardGeocode', () => {
      const TEST_API_KEY = 'test-api-key'
      const TEST_ADDRESS = '123 Main Street, New York'
      const TEST_LIMIT = 5
      const API_ENDPOINT = 'https://api.locationiq.com/v1/search.php'
      const API_TIMEOUT = 5000
      const API_FORMAT = 'json'
      const ERROR_TYPE = 'forward_geocode'

      let axios
      let logger
      let requestForwardGeocode

      beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()

        jest.doMock('../../../src/constants', () => ({
          ...DEFAULT_CONSTANTS,
          LOCATION_IQ_API_KEY: TEST_API_KEY
        }))

        jest.doMock('../../../src/utils/errorHandler', () => ({
          handleExternalApiError: jest.fn()
        }))

        jest.doMock('../../../src/utils/logger', () => ({
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn()
        }))

        axios = require('axios')
        logger = require('../../../src/utils/logger')
        requestForwardGeocode = require('../../../src/clients/locationiq').requestForwardGeocode
      })

      describe('successful API call', () => {
        test.each([
          {
            mockData: [
              { lat: '40.7128', lon: '-74.0060', display_name: 'New York, NY' },
              { lat: '40.7580', lon: '-73.9855', display_name: 'Mid Manhattan' }
            ],
            expectedResult: { lat: '40.7128', lon: '-74.0060', display_name: 'New York, NY' },
            expectedResultCount: 2
          },
          {
            mockData: [{ lat: '25.7617', lon: '-80.1918', display_name: 'Miami, FL' }],
            expectedResult: { lat: '25.7617', lon: '-80.1918', display_name: 'Miami, FL' },
            expectedResultCount: 1
          }
        ])(
          'should make correct API call and return first result',
          async ({ mockData, expectedResult, expectedResultCount }) => {
            axios.get.mockResolvedValue({ data: mockData })

            const result = await requestForwardGeocode(TEST_ADDRESS, TEST_LIMIT)

            const expectedTest = {
              axiosGetParams: [
                API_ENDPOINT,
                {
                  params: {
                    key: TEST_API_KEY,
                    q: TEST_ADDRESS,
                    format: API_FORMAT,
                    limit: TEST_LIMIT
                  },
                  timeout: API_TIMEOUT
                }
              ],
              debugLogs: {
                firstCall: [
                  'LocationIQ forward geocode request',
                  { address: TEST_ADDRESS }
                ],
                secondCall: [
                  'LocationIQ forward geocode success',
                  { resultCount: expectedResultCount }
                ]
              }
            }

            expect(axios.get).toHaveBeenCalledWith(...expectedTest.axiosGetParams)
            expect(logger.debug).toHaveBeenCalledTimes(2)
            expect(logger.debug).toHaveBeenNthCalledWith(
              1,
              ...expectedTest.debugLogs.firstCall
            )
            expect(logger.debug).toHaveBeenNthCalledWith(
              2,
              ...expectedTest.debugLogs.secondCall
            )
            expect(result).toEqual(expectedResult)
          }
        )
      })

      describe('no results found', () => {
        test.each([
          { mockData: [], addressParam: TEST_ADDRESS },
          { mockData: undefined, addressParam: TEST_ADDRESS }
        ])(
          'should throw error when no results found',
          async ({ mockData, addressParam }) => {
            axios.get.mockResolvedValue({ data: mockData })

            await expect(requestForwardGeocode(addressParam, TEST_LIMIT)).rejects.toThrow(
              `No results found for address: ${addressParam}`
            )

            expect(logger.info).toHaveBeenCalledWith(
              'No geocoding results found for address',
              { address: addressParam }
            )
          }
        )
      })

      describe('API call failure', () => {
        test('should handle API errors properly', async () => {
          const error = new Error('API Error')
          const errorHandlerMocked = require('../../../src/utils/errorHandler')

          axios.get.mockImplementation(() => {
            throw error
          })

          const expectedTest = {
            handleExternalApiErrorParams: [error, ERROR_TYPE, { timeout: API_TIMEOUT }]
          }

          await requestForwardGeocode(TEST_ADDRESS, TEST_LIMIT)

          expect(errorHandlerMocked.handleExternalApiError).toHaveBeenCalledWith(
            ...expectedTest.handleExternalApiErrorParams
          )
        })
      })
    })

    describe('requestReverseGeocode', () => {
      const TEST_API_KEY = 'test-api-key'
      const TEST_LATITUDE = 40.7128
      const TEST_LONGITUDE = -74.006
      const API_ENDPOINT = 'https://api.locationiq.com/v1/reverse.php'
      const API_TIMEOUT = 5000
      const API_FORMAT = 'json'
      const ERROR_TYPE = 'reverse_geocode'

      let axios
      let logger
      let requestReverseGeocode

      beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()

        jest.doMock('../../../src/constants', () => ({
          ...DEFAULT_CONSTANTS,
          LOCATION_IQ_API_KEY: TEST_API_KEY
        }))

        jest.doMock('../../../src/utils/errorHandler', () => ({
          handleExternalApiError: jest.fn()
        }))

        jest.doMock('../../../src/utils/logger', () => ({
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn()
        }))

        axios = require('axios')
        logger = require('../../../src/utils/logger')
        requestReverseGeocode = require('../../../src/clients/locationiq').requestReverseGeocode
      })

      describe('successful API call', () => {
        test.each([
          {
            mockData: { display_name: 'New York, New York, United States', address: {} },
            expectedResult: { display_name: 'New York, New York, United States', address: {} }
          },
          {
            mockData: { display_name: 'Miami, Florida, United States', address: {} },
            expectedResult: { display_name: 'Miami, Florida, United States', address: {} }
          }
        ])(
          'should make correct API call and return data',
          async ({ mockData, expectedResult }) => {
            axios.get.mockResolvedValue({ data: mockData })

            const result = await requestReverseGeocode(TEST_LATITUDE, TEST_LONGITUDE)

            const expectedTest = {
              axiosGetParams: [
                API_ENDPOINT,
                {
                  params: {
                    key: TEST_API_KEY,
                    lat: TEST_LATITUDE,
                    lon: TEST_LONGITUDE,
                    format: API_FORMAT
                  },
                  timeout: API_TIMEOUT
                }
              ],
              debugLogs: {
                firstCall: [
                  'LocationIQ reverse geocode request',
                  { latitude: TEST_LATITUDE, longitude: TEST_LONGITUDE }
                ],
                secondCall: ['LocationIQ reverse geocode success']
              }
            }

            expect(axios.get).toHaveBeenCalledWith(...expectedTest.axiosGetParams)
            expect(logger.debug).toHaveBeenCalledTimes(2)
            expect(logger.debug).toHaveBeenNthCalledWith(
              1,
              ...expectedTest.debugLogs.firstCall
            )
            expect(logger.debug).toHaveBeenNthCalledWith(
              2,
              expectedTest.debugLogs.secondCall[0]
            )
            expect(result).toEqual(expectedResult)
          }
        )
      })

      describe('API call failure', () => {
        test('should handle API errors properly', async () => {
          const error = new Error('API Error')
          const errorHandlerMocked = require('../../../src/utils/errorHandler')

          axios.get.mockImplementation(() => {
            throw error
          })

          const expectedTest = {
            handleExternalApiErrorParams: [error, ERROR_TYPE, { timeout: API_TIMEOUT }]
          }

          await requestReverseGeocode(TEST_LATITUDE, TEST_LONGITUDE)

          expect(errorHandlerMocked.handleExternalApiError).toHaveBeenCalledWith(
            ...expectedTest.handleExternalApiErrorParams
          )
        })
      })
    })
  })
})
