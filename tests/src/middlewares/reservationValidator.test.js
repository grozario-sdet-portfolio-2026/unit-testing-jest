const {
  validateCreateReservation,
  validateCreateReservationMiddleware,
  validateNumberOfPeople,
  validateReservationDateTime,
  validateGroupSizeAgainstCapacity,
  validateUpdateReservation,
  validateUpdateReservationMiddleware
} = require('../../../src/middlewares/reservationValidator')
const responseHandler = require('../../../src/utils/responseHandler')

jest.mock('../../../src/utils/responseHandler')

describe('Reservation Validator Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateNumberOfPeople', () => {
    describe('valid cases', () => {
      test.each([
        { numberOfPeople: 1 },
        { numberOfPeople: 2 },
        { numberOfPeople: 10 },
        { numberOfPeople: 100 }
      ])(
        'should validate valid number of people - numberOfPeople: $numberOfPeople',
        ({ numberOfPeople }) => {
          expect(() =>
            validateNumberOfPeople(numberOfPeople)
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          numberOfPeople: 0,
          expectedError: 'Number of people must be a positive number'
        },
        {
          numberOfPeople: -1,
          expectedError: 'Number of people must be a positive number'
        },
        {
          numberOfPeople: -10,
          expectedError: 'Number of people must be a positive number'
        },
        {
          numberOfPeople: '5',
          expectedError: 'Number of people must be a positive number'
        },
        {
          numberOfPeople: null,
          expectedError: 'Number of people must be a positive number'
        },
        {
          numberOfPeople: undefined,
          expectedError: 'Number of people must be a positive number'
        }
      ])(
        'should throw error for invalid number of people - numberOfPeople: $numberOfPeople',
        ({ numberOfPeople, expectedError }) => {
          expect(() =>
            validateNumberOfPeople(numberOfPeople)
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateReservationDateTime', () => {
    describe('valid cases', () => {
      test('should validate a future date and time', () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)
        const dateStr = futureDate.toISOString().split('T')[0]
        const timeStr = '19:00'

        expect(() =>
          validateReservationDateTime(dateStr, timeStr)
        ).not.toThrow()
      })

      test('should validate various future times', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]

        const validTimes = ['12:00', '18:30', '20:45', '09:15']

        validTimes.forEach((time) => {
          expect(() =>
            validateReservationDateTime(dateStr, time)
          ).not.toThrow()
        })
      })
    })

    describe('error cases', () => {
      test('should throw error for past date and time', () => {
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        const dateStr = pastDate.toISOString().split('T')[0]
        const timeStr = '19:00'

        expect(() =>
          validateReservationDateTime(dateStr, timeStr)
        ).toThrow('Reservation date and time must be in the future')
      })

      test('should throw error for current time (very close to now)', () => {
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const timeStr = `${hours}:${minutes}`

        expect(() =>
          validateReservationDateTime(dateStr, timeStr)
        ).toThrow('Reservation date and time must be in the future')
      })

      test.each([
        {
          date: '2026-13-45',
          time: '19:00',
          description: 'invalid month and day'
        },
        {
          date: 'invalid-date',
          time: '19:00',
          description: 'completely invalid date string'
        },
        {
          date: '2026-01-01',
          time: '25:00',
          description: 'invalid hour in time'
        },
        {
          date: '2026-01-01',
          time: '12:60',
          description: 'invalid minute in time'
        }
      ])(
        'should throw error for invalid date format - $description (date: $date, time: $time)',
        ({ date, time }) => {
          expect(() =>
            validateReservationDateTime(date, time)
          ).toThrow('Invalid reservation date or time format')
        }
      )
    })
  })

  describe('validateGroupSizeAgainstCapacity', () => {
    describe('valid cases', () => {
      test.each([
        { numberOfPeople: 1, restaurantCapacity: 1 },
        { numberOfPeople: 5, restaurantCapacity: 10 },
        { numberOfPeople: 50, restaurantCapacity: 100 },
        { numberOfPeople: 1, restaurantCapacity: 1000 }
      ])(
        'should validate group size within capacity - numberOfPeople: $numberOfPeople, capacity: $restaurantCapacity',
        ({ numberOfPeople, restaurantCapacity }) => {
          expect(() =>
            validateGroupSizeAgainstCapacity(numberOfPeople, restaurantCapacity)
          ).not.toThrow()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          numberOfPeople: 6,
          restaurantCapacity: 5,
          expectedError:
            'Number of people (6) exceeds restaurant capacity (5)'
        },
        {
          numberOfPeople: 101,
          restaurantCapacity: 100,
          expectedError:
            'Number of people (101) exceeds restaurant capacity (100)'
        },
        {
          numberOfPeople: 1001,
          restaurantCapacity: 500,
          expectedError:
            'Number of people (1001) exceeds restaurant capacity (500)'
        }
      ])(
        'should throw error when group size exceeds capacity - numberOfPeople: $numberOfPeople, capacity: $restaurantCapacity',
        ({ numberOfPeople, restaurantCapacity, expectedError }) => {
          expect(() =>
            validateGroupSizeAgainstCapacity(numberOfPeople, restaurantCapacity)
          ).toThrow(expectedError)
        }
      )
    })
  })

  describe('validateCreateReservation', () => {
    describe('valid cases', () => {
      test('should validate complete and valid reservation data', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]

        const validReservation = {
          restaurant_id: 1,
          customer_name: 'John Doe',
          number_of_people: 4,
          reservation_date: dateStr,
          reservation_time: '19:00'
        }

        expect(() =>
          validateCreateReservation(validReservation)
        ).not.toThrow()
      })

      test.each([
        {
          restaurant_id: 100,
          customer_name: 'Jane Smith',
          number_of_people: 2,
          reservation_date: '2027-06-15',
          reservation_time: '18:30'
        },
        {
          restaurant_id: 1,
          customer_name: 'Bob Johnson',
          number_of_people: 10,
          reservation_date: '2026-12-25',
          reservation_time: '20:00'
        }
      ])(
        'should validate various valid reservations',
        (validReservation) => {
          expect(() =>
            validateCreateReservation(validReservation)
          ).not.toThrow()
        }
      )
    })

    describe('error cases - missing fields', () => {
      test.each([
        {
          reservationData: {
            customer_name: 'John',
            number_of_people: 2,
            reservation_date: '2027-01-01',
            reservation_time: '19:00'
          },
          description: 'missing restaurant_id'
        },
        {
          reservationData: {
            restaurant_id: 1,
            number_of_people: 2,
            reservation_date: '2027-01-01',
            reservation_time: '19:00'
          },
          description: 'missing customer_name'
        },
        {
          reservationData: {
            restaurant_id: 1,
            customer_name: 'John',
            reservation_date: '2027-01-01',
            reservation_time: '19:00'
          },
          description: 'missing number_of_people'
        },
        {
          reservationData: {
            restaurant_id: 1,
            customer_name: 'John',
            number_of_people: 2,
            reservation_time: '19:00'
          },
          description: 'missing reservation_date'
        },
        {
          reservationData: {
            restaurant_id: 1,
            customer_name: 'John',
            number_of_people: 2,
            reservation_date: '2027-01-01'
          },
          description: 'missing reservation_time'
        }
      ])(
        'should throw error - $description',
        ({ reservationData, _description }) => {
          expect(() =>
            validateCreateReservation(reservationData)
          ).toThrow(
            'Missing required fields: restaurant_id, customer_name, number_of_people, reservation_date, reservation_time'
          )
        }
      )
    })

    describe('error cases - invalid data', () => {
      test('should throw error for invalid number of people', () => {
        const invalidReservation = {
          restaurant_id: 1,
          customer_name: 'John',
          number_of_people: -5,
          reservation_date: '2027-01-01',
          reservation_time: '19:00'
        }

        expect(() =>
          validateCreateReservation(invalidReservation)
        ).toThrow('Number of people must be a positive number')
      })

      test('should throw error for past reservation date', () => {
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        const dateStr = pastDate.toISOString().split('T')[0]

        const invalidReservation = {
          restaurant_id: 1,
          customer_name: 'John',
          number_of_people: 4,
          reservation_date: dateStr,
          reservation_time: '19:00'
        }

        expect(() =>
          validateCreateReservation(invalidReservation)
        ).toThrow('Reservation date and time must be in the future')
      })
    })
  })

  describe('validateUpdateReservation', () => {
    describe('valid cases', () => {
      test('should validate update with number_of_people', () => {
        const updateData = { number_of_people: 5 }

        expect(() =>
          validateUpdateReservation(updateData)
        ).not.toThrow()
      })

      test('should validate update with future date and time', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]

        const updateData = {
          reservation_date: dateStr,
          reservation_time: '20:00'
        }

        expect(() =>
          validateUpdateReservation(updateData)
        ).not.toThrow()
      })

      test('should validate partial update with single field', () => {
        const updateData = { number_of_people: 3 }

        expect(() =>
          validateUpdateReservation(updateData)
        ).not.toThrow()
      })

      test('should validate empty update', () => {
        const updateData = {}

        expect(() =>
          validateUpdateReservation(updateData)
        ).not.toThrow()
      })
    })

    describe('error cases', () => {
      test('should throw error when updating with invalid number_of_people', () => {
        const updateData = { number_of_people: -1 }

        expect(() =>
          validateUpdateReservation(updateData)
        ).toThrow('Number of people must be a positive number')
      })

      test('should throw error when updating with past date', () => {
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        const dateStr = pastDate.toISOString().split('T')[0]

        const updateData = {
          reservation_date: dateStr,
          reservation_time: '19:00'
        }

        expect(() =>
          validateUpdateReservation(updateData)
        ).toThrow('Reservation date and time must be in the future')
      })

      test('should not validate when only date is provided (both date and time required)', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]

        const updateData = { reservation_date: dateStr }

        expect(() =>
          validateUpdateReservation(updateData)
        ).not.toThrow()
      })
    })
  })

  describe('validateCreateReservationMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        body: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test('should call next() for valid reservation data', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]

        req.body = {
          restaurant_id: 1,
          customer_name: 'John Doe',
          number_of_people: 4,
          reservation_date: dateStr,
          reservation_time: '19:00'
        }

        validateCreateReservationMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error cases', () => {
      test('should call sendValidationError for missing required fields', () => {
        req.body = {
          restaurant_id: 1,
          customer_name: 'John'
        }

        validateCreateReservationMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Missing required fields: restaurant_id, customer_name, number_of_people, reservation_date, reservation_time'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for invalid number_of_people', () => {
        req.body = {
          restaurant_id: 1,
          customer_name: 'John',
          number_of_people: -1,
          reservation_date: '2027-01-01',
          reservation_time: '19:00'
        }

        validateCreateReservationMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Number of people must be a positive number'
        )
        expect(next).not.toHaveBeenCalled()
      })
    })
  })

  describe('validateUpdateReservationMiddleware', () => {
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
        req.body = { number_of_people: 5 }

        validateUpdateReservationMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })

      test('should call next() for empty update body', () => {
        req.body = {}

        validateUpdateReservationMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
      })
    })

    describe('error cases', () => {
      test('should call sendValidationError for invalid number_of_people', () => {
        req.body = { number_of_people: -5 }

        validateUpdateReservationMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Number of people must be a positive number'
        )
        expect(next).not.toHaveBeenCalled()
      })

      test('should call sendValidationError for past reservation date', () => {
        const pastDate = new Date()
        pastDate.setFullYear(pastDate.getFullYear() - 1)
        const dateStr = pastDate.toISOString().split('T')[0]

        req.body = {
          reservation_date: dateStr,
          reservation_time: '19:00'
        }

        validateUpdateReservationMiddleware(req, res, next)

        expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
          res,
          'Reservation date and time must be in the future'
        )
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
