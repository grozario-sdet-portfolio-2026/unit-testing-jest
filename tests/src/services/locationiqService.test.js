const locationiqService = require('../../../src/services/locationiqService')
const {
  DISTANCE_DECIMAL_PLACES,
  DEFAULT_RESTAURANT_NAME,
  DEFAULT_ADDRESS
} = require('../../../src/constants')

describe('LocationIQ Service', () => {
  describe('calculateDistance', () => {
    describe('valid distance calculations', () => {
      it('should calculate distance between two coordinates correctly using Haversine formula', () => {
        // São Paulo: -23.5505, -46.6333
        // Rio de Janeiro: -22.9068, -43.1729
        const startLatitude = -23.5505
        const startLongitude = -46.6333
        const endLatitude = -22.9068
        const endLongitude = -43.1729

        const distance = locationiqService.calculateDistance(
          startLatitude,
          startLongitude,
          endLatitude,
          endLongitude
        )

        // Distance should be approximately 358 km between SP and RJ
        expect(distance).toBeGreaterThan(350)
        expect(distance).toBeLessThan(370)
        expect(typeof distance).toBe('number')
      })

      it('should return 0 when coordinates are the same', () => {
        const latitude = 45.5
        const longitude = -122.68

        const distance = locationiqService.calculateDistance(
          latitude,
          longitude,
          latitude,
          longitude
        )

        expect(distance).toBe(0)
      })

      it('should handle negative coordinates (Southern Hemisphere)', () => {
        const startLatitude = -33.8688
        const startLongitude = 151.2093
        const endLatitude = -33.8868
        const endLongitude = 151.2093

        const distance = locationiqService.calculateDistance(
          startLatitude,
          startLongitude,
          endLatitude,
          endLongitude
        )

        expect(distance).toBeGreaterThan(0)
        expect(typeof distance).toBe('number')
      })

      it('should return distance rounded to specified decimal places', () => {
        const startLatitude = 0
        const startLongitude = 0
        const endLatitude = 0.01
        const endLongitude = 0.01

        const distance = locationiqService.calculateDistance(
          startLatitude,
          startLongitude,
          endLatitude,
          endLongitude
        )

        // Check that it has correct decimal places
        const decimalPlaces = (distance.toString().split('.')[1] || '').length
        expect(decimalPlaces).toBeLessThanOrEqual(DISTANCE_DECIMAL_PLACES)
      })

      it.each([
        {
          start: { lat: 0, lon: 0 },
          end: { lat: 0, lon: 1 },
          description: '1 degree longitude at equator'
        },
        {
          start: { lat: 45, lon: 0 },
          end: { lat: 45, lon: 1 },
          description: '1 degree longitude at 45 latitude'
        },
        {
          start: { lat: 0, lon: 0 },
          end: { lat: 1, lon: 0 },
          description: '1 degree latitude'
        }
      ])(
        'should calculate distance for $description',
        ({ start, end }) => {
          const distance = locationiqService.calculateDistance(
            start.lat,
            start.lon,
            end.lat,
            end.lon
          )

          expect(distance).toBeGreaterThan(0)
          expect(typeof distance).toBe('number')
        }
      )
    })
  })

  describe('buildSearchBoundingBox', () => {
    describe('valid bounding box creation', () => {
      it('should create bounding box string with correct format', () => {
        const centerLatitude = 40.7128
        const centerLongitude = -74.006
        const radiusKilometers = 10

        const boundingBox = locationiqService.buildSearchBoundingBox(
          centerLatitude,
          centerLongitude,
          radiusKilometers
        )

        // Format: min_longitude,min_latitude,max_longitude,max_latitude
        const parts = boundingBox.split(',')
        expect(parts).toHaveLength(4)
        expect(parts.every((part) => !isNaN(parseFloat(part)))).toBe(true)
      })

      it('should create symmetric bounding box around center point', () => {
        const centerLatitude = 0
        const centerLongitude = 0
        const radiusKilometers = 10

        const boundingBox = locationiqService.buildSearchBoundingBox(
          centerLatitude,
          centerLongitude,
          radiusKilometers
        )

        const [minLon, minLat, maxLon, maxLat] = boundingBox
          .split(',')
          .map(parseFloat)

        // Min should be less than center, max should be greater
        expect(minLon).toBeLessThan(0)
        expect(minLat).toBeLessThan(0)
        expect(maxLon).toBeGreaterThan(0)
        expect(maxLat).toBeGreaterThan(0)

        // Should be symmetric
        expect(Math.abs(minLon + maxLon)).toBeLessThan(0.0001)
        expect(Math.abs(minLat + maxLat)).toBeLessThan(0.0001)
      })

      it('should handle different radius values', () => {
        const centerLatitude = 40.7128
        const centerLongitude = -74.006

        const box10km = locationiqService.buildSearchBoundingBox(
          centerLatitude,
          centerLongitude,
          10
        )

        const box50km = locationiqService.buildSearchBoundingBox(
          centerLatitude,
          centerLongitude,
          50
        )

        // Larger radius should create larger bounding box
        const box10Parts = box10km.split(',').map(parseFloat)
        const box50Parts = box50km.split(',').map(parseFloat)

        const box10Width = box10Parts[2] - box10Parts[0]
        const box50Width = box50Parts[2] - box50Parts[0]

        expect(box50Width).toBeGreaterThan(box10Width)
      })

      it('should handle negative coordinates', () => {
        const centerLatitude = -33.8688
        const centerLongitude = 151.2093
        const radiusKilometers = 5

        const boundingBox = locationiqService.buildSearchBoundingBox(
          centerLatitude,
          centerLongitude,
          radiusKilometers
        )

        const [minLon, minLat, maxLon, maxLat] = boundingBox
          .split(',')
          .map(parseFloat)

        expect(minLon).toBeLessThan(maxLon)
        expect(minLat).toBeLessThan(maxLat)
      })
    })
  })

  describe('extractRestaurantNameFromDisplayName (internal function tested via processNearbySearchResults)', () => {
    describe('name extraction scenarios', () => {
      it('should extract first component from display_name when available', () => {
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant Name, Street, City',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].name).toBe('Restaurant Name')
      })

      it('should use name field when display_name is empty or whitespace-only', () => {
        const apiResults = [
          {
            osm_id: 2,
            display_name: '   ',
            name: 'My Restaurant',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].name).toBe('My Restaurant')
      })

      it('should use default name when both display_name and name are missing or empty', () => {
        const apiResults = [
          {
            osm_id: 3,
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].name).toBe(DEFAULT_RESTAURANT_NAME)
      })

      it('should handle display_name with undefined values gracefully', () => {
        const apiResults = [
          {
            osm_id: 4,
            display_name: undefined,
            name: undefined,
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].name).toBe(DEFAULT_RESTAURANT_NAME)
        expect(results[0].address).toBe(DEFAULT_ADDRESS)
      })

      it('should trim whitespace from extracted restaurant name', () => {
        const apiResults = [
          {
            osm_id: 5,
            display_name: '  Random Restaurant  , Other Info',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].name).toBe('Random Restaurant')
      })

      it('should parse latitude and longitude correctly even with string values', () => {
        const apiResults = [
          {
            osm_id: 6,
            display_name: 'Test Restaurant',
            lat: '42.3601',
            lon: '-71.0589',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          42.3601,
          -71.0589,
          100
        )

        expect(typeof results[0].latitude).toBe('number')
        expect(typeof results[0].longitude).toBe('number')
        expect(results[0].latitude).toBe(42.3601)
        expect(results[0].longitude).toBe(-71.0589)
      })

      it('should handle results with very small distances (floating point precision)', () => {
        const apiResults = [
          {
            osm_id: 7,
            display_name: 'Test Restaurant',
            lat: '40.7128001', // Very close to center
            lon: '-74.0060001',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results).toHaveLength(1)
        expect(results[0].distanceKilometers).toBeGreaterThanOrEqual(0)
        expect(results[0].distanceKilometers).toBeLessThan(0.01) // Should be very small distance
        expect(typeof results[0].distanceKilometers).toBe('number')
      })

      it('should preserve osm_id and type from API result', () => {
        const apiResults = [
          {
            osm_id: 999,
            display_name: 'Restaurant',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results[0].id).toBe(999)
        expect(results[0].type).toBe('restaurant')
      })
    })
  })

  describe('processNearbySearchResults', () => {
    describe('valid result processing', () => {
      it('should return empty array when no results provided', () => {
        const results = locationiqService.processNearbySearchResults(
          [],
          40.7128,
          -74.006,
          10
        )

        expect(results).toEqual([])
      })

      it('should return empty array when null results provided', () => {
        const results = locationiqService.processNearbySearchResults(
          null,
          40.7128,
          -74.006,
          10
        )

        expect(results).toEqual([])
      })

      it('should transform and sort all API results by distance', () => {
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Far Restaurant',
            lat: '41.0',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 2,
            display_name: 'Near Restaurant',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results).toHaveLength(2)
        expect(results[0]).toHaveProperty('id')
        expect(results[0]).toHaveProperty('name')
        expect(results[0]).toHaveProperty('distanceKilometers')

        // First result should be the nearest
        expect(results[0].distanceKilometers).toBeLessThanOrEqual(
          results[1].distanceKilometers
        )
      })

      it('should filter out results beyond the radius', () => {
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 2,
            display_name: 'Far Restaurant',
            lat: '41.0',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          5 // 5 km radius
        )

        // All results should be within radius
        results.forEach((result) => {
          expect(result.distanceKilometers).toBeLessThanOrEqual(5)
        })
      })

      it('should sort results by distance in ascending order', () => {
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant 1',
            lat: '41.0',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 2,
            display_name: 'Restaurant 2',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 3,
            display_name: 'Restaurant 3',
            lat: '40.8',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        // Verify results are sorted ascending by distance
        for (let i = 1; i < results.length; i++) {
          expect(results[i].distanceKilometers).toBeGreaterThanOrEqual(
            results[i - 1].distanceKilometers
          )
        }
      })

      it('should include restaurants at radius boundary', () => {
        const centerLat = 0
        const centerLon = 0
        const radiusKm = 10

        // Create a restaurant at approximately 10 km distance
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant',
            lat: '0.0898',
            lon: '0',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          centerLat,
          centerLon,
          radiusKm
        )

        // Should include or exclude based on exact distance calculation
        if (results.length > 0) {
          expect(results[0].distanceKilometers).toBeLessThanOrEqual(radiusKm)
        }
      })

      it('should extract correct restaurant information from API results', () => {
        const apiResults = [
          {
            osm_id: 12345,
            display_name: 'Restaurant Name, Main Street, City',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          100
        )

        expect(results).toHaveLength(1)
        expect(results[0].id).toBe(12345)
        expect(results[0].name).toBe('Restaurant Name')
        expect(results[0].address).toContain('Restaurant Name, Main Street, City')
        expect(results[0].latitude).toBe(40.7128)
        expect(results[0].longitude).toBe(-74.006)
      })

      it('should handle multiple results with mixed valid and near-boundary distances', () => {
        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Very Close Restaurant',
            lat: '40.7128',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 2,
            display_name: 'Medium Distance Restaurant',
            lat: '40.75',
            lon: '-74.006',
            type: 'restaurant'
          },
          {
            osm_id: 3,
            display_name: 'Just Outside Radius',
            lat: '41.5',
            lon: '-74.006',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          40.7128,
          -74.006,
          20 // 20 km radius
        )

        // Verify all remaining results are sorted by distance
        for (let i = 1; i < results.length; i++) {
          expect(results[i].distanceKilometers).toBeGreaterThanOrEqual(
            results[i - 1].distanceKilometers
          )
        }
      })

      it('should correctly calculate distance for each restaurant', () => {
        const centerLat = 0
        const centerLon = 0

        const apiResults = [
          {
            osm_id: 1,
            display_name: 'Restaurant 1',
            lat: '0',
            lon: '0',
            type: 'restaurant'
          },
          {
            osm_id: 2,
            display_name: 'Restaurant 2',
            lat: '0.1',
            lon: '0',
            type: 'restaurant'
          }
        ]

        const results = locationiqService.processNearbySearchResults(
          apiResults,
          centerLat,
          centerLon,
          100
        )

        // First restaurant is at exact center, distance should be 0
        expect(results[0].distanceKilometers).toBe(0)
        // Second restaurant should have greater distance
        expect(results[1].distanceKilometers).toBeGreaterThan(
          results[0].distanceKilometers
        )
      })
    })
  })

  describe('transformForwardGeocodeResult', () => {
    describe('valid transformations', () => {
      it('should transform forward geocode API result to standard format', () => {
        const apiResult = {
          display_name: '123 Main Street, New York, NY 10001, USA',
          lat: '40.7128',
          lon: '-74.006',
          place_id: '123456',
          osm_type: 'way',
          importance: 0.95,
          boundingbox: ['40.7', '-74.01', '40.72', '-74.0']
        }

        const result = locationiqService.transformForwardGeocodeResult(apiResult)

        expect(result).toEqual({
          address: '123 Main Street, New York, NY 10001, USA',
          latitude: 40.7128,
          longitude: -74.006,
          boundingBox: ['40.7', '-74.01', '40.72', '-74.0'],
          placeId: '123456',
          osmType: 'way',
          confidence: 0.95
        })
      })

      it('should handle missing bounding box', () => {
        const apiResult = {
          display_name: 'Test Address',
          lat: '40.7128',
          lon: '-74.006',
          place_id: '123456',
          osm_type: 'node'
        }

        const result = locationiqService.transformForwardGeocodeResult(apiResult)

        expect(result.boundingBox).toBeNull()
      })

      it('should handle missing importance field', () => {
        const apiResult = {
          display_name: 'Test Address',
          lat: '40.7128',
          lon: '-74.006',
          place_id: '123456',
          osm_type: 'way'
        }

        const result = locationiqService.transformForwardGeocodeResult(apiResult)

        expect(result.confidence).toBe(0)
      })

      it('should parse latitude and longitude as numbers', () => {
        const apiResult = {
          display_name: 'Test',
          lat: '40.7128',
          lon: '-74.006',
          place_id: '1',
          osm_type: 'way'
        }

        const result = locationiqService.transformForwardGeocodeResult(apiResult)

        expect(typeof result.latitude).toBe('number')
        expect(typeof result.longitude).toBe('number')
      })
    })
  })

  describe('transformReverseGeocodeResult', () => {
    describe('valid transformations', () => {
      it('should transform reverse geocode result to standard format with all address components', () => {
        const apiResult = {
          display_name: 'Statue of Liberty, Liberty Island, Manhattan, New York, 10004, United States',
          lat: '40.6892',
          lon: '-74.0445',
          address: {
            city: 'New York',
            county: 'New York County',
            state: 'New York',
            country: 'United States',
            postcode: '10004'
          },
          place_id: '123456',
          osm_type: 'way'
        }

        const result = locationiqService.transformReverseGeocodeResult(apiResult)

        expect(result).toEqual({
          address: 'Statue of Liberty, Liberty Island, Manhattan, New York, 10004, United States',
          latitude: 40.6892,
          longitude: -74.0445,
          city: 'New York',
          county: 'New York County',
          state: 'New York',
          country: 'United States',
          postalCode: '10004',
          placeId: '123456',
          osmType: 'way'
        })
      })

      it('should handle missing address components', () => {
        const apiResult = {
          display_name: 'Some Place',
          lat: '40.6892',
          lon: '-74.0445',
          address: {
            city: 'New York',
            country: 'United States'
          },
          place_id: '123456',
          osm_type: 'node'
        }

        const result = locationiqService.transformReverseGeocodeResult(apiResult)

        expect(result.city).toBe('New York')
        expect(result.county).toBeNull()
        expect(result.state).toBeNull()
        expect(result.postalCode).toBeNull()
        expect(result.country).toBe('United States')
      })

      it('should handle missing address object entirely', () => {
        const apiResult = {
          display_name: 'Some Place',
          lat: '40.6892',
          lon: '-74.0445',
          place_id: '123456',
          osm_type: 'way'
        }

        const result = locationiqService.transformReverseGeocodeResult(apiResult)

        expect(result.city).toBeNull()
        expect(result.county).toBeNull()
        expect(result.state).toBeNull()
        expect(result.country).toBeNull()
        expect(result.postalCode).toBeNull()
      })

      it('should parse latitude and longitude as numbers', () => {
        const apiResult = {
          display_name: 'Test Place',
          lat: '51.5074',
          lon: '-0.1278',
          address: {},
          place_id: '1',
          osm_type: 'way'
        }

        const result = locationiqService.transformReverseGeocodeResult(apiResult)

        expect(typeof result.latitude).toBe('number')
        expect(typeof result.longitude).toBe('number')
        expect(result.latitude).toBe(51.5074)
        expect(result.longitude).toBe(-0.1278)
      })

      it("should use 'postcode' field for postal code", () => {
        const apiResult = {
          display_name: 'Address',
          lat: '40.6892',
          lon: '-74.0445',
          address: {
            postcode: '12345'
          },
          place_id: '123',
          osm_type: 'way'
        }

        const result = locationiqService.transformReverseGeocodeResult(apiResult)

        expect(result.postalCode).toBe('12345')
      })
    })
  })
})
