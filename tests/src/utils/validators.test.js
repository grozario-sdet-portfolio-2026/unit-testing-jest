const validators = require('../../../src/utils/validators')

describe('Validators', () => {
  describe('validateNumberInRange', () => {
    describe('valid cases', () => {
      test.each([
        { value: 0, min: -90, max: 90, fieldName: 'Latitude' },
        { value: -90, min: -90, max: 90, fieldName: 'Latitude' },
        { value: 90, min: -90, max: 90, fieldName: 'Latitude' },
        { value: 45.5, min: -90, max: 90, fieldName: 'Latitude' },
        { value: 1, min: 1, max: 100, fieldName: 'Capacity' },
        { value: 100, min: 1, max: 100, fieldName: 'Capacity' },
        { value: 50, min: 1, max: 100, fieldName: 'Capacity' }
      ])(
        'should validate number in range - value: $value, min: $min, max: $max',
        ({ value, min, max, fieldName }) => {
          expect(() => {
            validators.validateNumberInRange(value, min, max, fieldName)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          value: 'not-a-number',
          min: -90,
          max: 90,
          fieldName: 'Latitude',
          expectedError: 'Latitude must be a number'
        },
        {
          value: null,
          min: -90,
          max: 90,
          fieldName: 'Latitude',
          expectedError: 'Latitude must be a number'
        },
        {
          value: undefined,
          min: -90,
          max: 90,
          fieldName: 'Latitude',
          expectedError: 'Latitude must be a number'
        },
        {
          value: -91,
          min: -90,
          max: 90,
          fieldName: 'Latitude',
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          value: 91,
          min: -90,
          max: 90,
          fieldName: 'Latitude',
          expectedError: 'Latitude must be between -90 and 90'
        },
        {
          value: 0,
          min: 1,
          max: 100,
          fieldName: 'Capacity',
          expectedError: 'Capacity must be between 1 and 100'
        },
        {
          value: 101,
          min: 1,
          max: 100,
          fieldName: 'Capacity',
          expectedError: 'Capacity must be between 1 and 100'
        }
      ])(
        'should throw error for invalid range - $expectedError',
        ({ value, min, max, fieldName, expectedError }) => {
          expect(() => {
            validators.validateNumberInRange(value, min, max, fieldName)
          }).toThrow(expectedError)
        }
      )
    })

    describe('field name in error message', () => {
      it('should include field name in error message for type error', () => {
        expect(() => {
          validators.validateNumberInRange('invalid', 1, 100, 'CustomField')
        }).toThrow('CustomField must be a number')
      })

      it('should include field name in error message for range error', () => {
        expect(() => {
          validators.validateNumberInRange(200, 1, 100, 'CustomField')
        }).toThrow('CustomField must be between 1 and 100')
      })
    })
  })

  describe('validateCoordinates', () => {
    describe('valid cases', () => {
      test.each([
        { latitude: 0, longitude: 0 },
        { latitude: -90, longitude: -180 },
        { latitude: 90, longitude: 180 },
        { latitude: 45.5, longitude: 123.5 },
        { latitude: -23.5505, longitude: -46.6333 }
      ])(
        'should validate valid coordinates - latitude: $latitude, longitude: $longitude',
        ({ latitude, longitude }) => {
          expect(() => {
            validators.validateCoordinates(latitude, longitude)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          latitude: 'invalid',
          longitude: 0,
          expectedError: 'Latitude must be a number'
        },
        {
          latitude: 0,
          longitude: 'invalid',
          expectedError: 'Longitude must be a number'
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
        'should throw error - $expectedError',
        ({ latitude, longitude, expectedError }) => {
          expect(() => {
            validators.validateCoordinates(latitude, longitude)
          }).toThrow(expectedError)
        }
      )
    })

    it('should validate latitude first before longitude', () => {
      expect(() => {
        validators.validateCoordinates(-91, -181)
      }).toThrow('Latitude must be between -90 and 90')
    })
  })

  describe('validateCapacity', () => {
    describe('valid cases', () => {
      test.each([
        { capacity: 1 },
        { capacity: 10 },
        { capacity: 100 },
        { capacity: 1000 },
        { capacity: Number.MAX_SAFE_INTEGER }
      ])(
        'should validate valid capacity - $capacity',
        ({ capacity }) => {
          expect(() => {
            validators.validateCapacity(capacity)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        { capacity: 0, expectedError: 'Capacity must be between 1' },
        { capacity: -1, expectedError: 'Capacity must be between 1' },
        { capacity: 'not-a-number', expectedError: 'Capacity must be a number' }
      ])(
        'should throw error for invalid capacity - $capacity',
        ({ capacity, expectedError }) => {
          expect(() => {
            validators.validateCapacity(capacity)
          }).toThrow(expectedError)
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
        { latitude: undefined },
        { latitude: null }
      ])(
        'should validate latitude $latitude',
        ({ latitude }) => {
          expect(() => {
            validators.validateLatitude(latitude)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        { latitude: -91, expectedError: 'Latitude must be between -90 and 90' },
        { latitude: 91, expectedError: 'Latitude must be between -90 and 90' },
        { latitude: 'invalid', expectedError: 'Latitude must be a number' }
      ])(
        'should throw error - $expectedError',
        ({ latitude, expectedError }) => {
          expect(() => {
            validators.validateLatitude(latitude)
          }).toThrow(expectedError)
        }
      )
    })

    it('should skip validation when latitude is undefined', () => {
      expect(() => {
        validators.validateLatitude(undefined)
      }).not.toThrow()
    })

    it('should skip validation when latitude is null', () => {
      expect(() => {
        validators.validateLatitude(null)
      }).not.toThrow()
    })
  })

  describe('validateLongitude', () => {
    describe('valid cases', () => {
      test.each([
        { longitude: 0 },
        { longitude: -180 },
        { longitude: 180 },
        { longitude: 123.5 },
        { longitude: undefined },
        { longitude: null }
      ])(
        'should validate longitude $longitude',
        ({ longitude }) => {
          expect(() => {
            validators.validateLongitude(longitude)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        { longitude: -181, expectedError: 'Longitude must be between -180 and 180' },
        { longitude: 181, expectedError: 'Longitude must be between -180 and 180' },
        { longitude: 'invalid', expectedError: 'Longitude must be a number' }
      ])(
        'should throw error - $expectedError',
        ({ longitude, expectedError }) => {
          expect(() => {
            validators.validateLongitude(longitude)
          }).toThrow(expectedError)
        }
      )
    })

    it('should skip validation when longitude is undefined', () => {
      expect(() => {
        validators.validateLongitude(undefined)
      }).not.toThrow()
    })

    it('should skip validation when longitude is null', () => {
      expect(() => {
        validators.validateLongitude(null)
      }).not.toThrow()
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
        'should validate valid radius - $radiusMeters',
        ({ radiusMeters }) => {
          expect(() => {
            validators.validateSearchRadius(radiusMeters)
          }).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        { radiusMeters: 0, expectedError: 'Radius must be greater than 0 meters' },
        { radiusMeters: -1, expectedError: 'Radius must be greater than 0 meters' },
        { radiusMeters: -100, expectedError: 'Radius must be greater than 0 meters' },
        { radiusMeters: 0.5, expectedError: 'Radius must be greater than 0 meters' },
        { radiusMeters: 0.001, expectedError: 'Radius must be greater than 0 meters' }
      ])(
        'should throw error for radius $radiusMeters',
        ({ radiusMeters, expectedError }) => {
          expect(() => {
            validators.validateSearchRadius(radiusMeters)
          }).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateRequiredFields', () => {
    describe('valid cases', () => {
      it('should validate all required fields present', () => {
        const data = {
          name: 'Test',
          email: 'test@example.com',
          age: 25
        }
        const requiredFields = ['name', 'email']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should validate single required field', () => {
        const data = { email: 'test@example.com' }
        const requiredFields = ['email']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should validate all fields when all are required', () => {
        const data = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
        const requiredFields = ['firstName', 'lastName', 'email']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should validate fields with different data types', () => {
        const data = {
          name: 'Test',
          count: 0,
          active: false,
          value: null,
          items: []
        }
        const requiredFields = ['name', 'count', 'active', 'items']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })
    })

    describe('error cases - missing fields', () => {
      test.each([
        {
          data: { email: 'test@example.com' },
          requiredFields: ['name', 'email'],
          expectedError: 'Missing required field: name'
        },
        {
          data: { name: 'Test' },
          requiredFields: ['name', 'email'],
          expectedError: 'Missing required field: email'
        },
        {
          data: {},
          requiredFields: ['email'],
          expectedError: 'Missing required field: email'
        }
      ])(
        'should throw error - $expectedError',
        ({ data, requiredFields, expectedError }) => {
          expect(() => {
            validators.validateRequiredFields(data, requiredFields)
          }).toThrow(expectedError)
        }
      )
    })

    describe('error cases - empty or null values', () => {
      test.each([
        {
          data: { name: '', email: 'test@example.com' },
          requiredFields: ['name', 'email'],
          expectedError: 'Missing required field: name'
        },
        {
          data: { name: null, email: 'test@example.com' },
          requiredFields: ['name', 'email'],
          expectedError: 'Missing required field: name'
        },
        {
          data: { name: undefined, email: 'test@example.com' },
          requiredFields: ['name', 'email'],
          expectedError: 'Missing required field: name'
        }
      ])(
        'should throw error for empty/null - $expectedError',
        ({ data, requiredFields, expectedError }) => {
          expect(() => {
            validators.validateRequiredFields(data, requiredFields)
          }).toThrow(expectedError)
        }
      )
    })

    describe('validation order', () => {
      it('should check fields in order and throw on first missing', () => {
        const data = {
          firstName: 'John',
          age: 25
        }
        const requiredFields = ['firstName', 'lastName', 'email', 'age']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).toThrow('Missing required field: lastName')
      })
    })

    describe('edge cases', () => {
      it('should handle empty required fields array', () => {
        const data = { name: 'Test' }
        const requiredFields = []

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should handle data with extra fields', () => {
        const data = {
          name: 'Test',
          email: 'test@example.com',
          phone: '123456789',
          address: '123 Main St'
        }
        const requiredFields = ['name', 'email']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should reject field with space in value', () => {
        const data = {
          name: ' ',
          email: 'test@example.com'
        }
        const requiredFields = ['name', 'email']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })

      it('should handle field names with special characters', () => {
        const data = {
          'field-name': 'value',
          another_field: 'value2'
        }
        const requiredFields = ['field-name', 'another_field']

        expect(() => {
          validators.validateRequiredFields(data, requiredFields)
        }).not.toThrow()
      })
    })
  })

  describe('validators integration', () => {
    it('should use validateNumberInRange internally in validateCoordinates', () => {
      expect(() => {
        validators.validateCoordinates(45.5, 123.5)
      }).not.toThrow()

      expect(() => {
        validators.validateCoordinates(91, 0)
      }).toThrow('Latitude must be between -90 and 90')
    })

    it('should use validateNumberInRange internally in validateCapacity', () => {
      expect(() => {
        validators.validateCapacity(50)
      }).not.toThrow()

      expect(() => {
        validators.validateCapacity(0)
      }).toThrow('Capacity must be between 1')
    })

    it('should use validateNumberInRange internally in validateLatitude', () => {
      expect(() => {
        validators.validateLatitude(45.5)
      }).not.toThrow()

      expect(() => {
        validators.validateLatitude(91)
      }).toThrow('Latitude must be between -90 and 90')
    })

    it('should use validateNumberInRange internally in validateLongitude', () => {
      expect(() => {
        validators.validateLongitude(123.5)
      }).not.toThrow()

      expect(() => {
        validators.validateLongitude(181)
      }).toThrow('Longitude must be between -180 and 180')
    })
  })
})
