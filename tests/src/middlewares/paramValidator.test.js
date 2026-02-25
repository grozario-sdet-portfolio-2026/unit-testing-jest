const {
  validateRestaurantIdMiddleware,
  validateReservationIdMiddleware,
  validateReservationFiltersMiddleware
} = require('../../../src/middlewares/paramValidator')
const responseHandler = require('../../../src/utils/responseHandler')

jest.mock('../../../src/utils/responseHandler')

describe('Param Validator Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateRestaurantIdMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        params: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test.each([
        { id: '1' },
        { id: '100' },
        { id: '999999' },
        { id: 1 },
        { id: 50 }
      ])(
        'should call next() for valid restaurant ID - id: $id',
        ({ id }) => {
          req.params = { id }

          validateRestaurantIdMiddleware(req, res, next)

          expect(next).toHaveBeenCalled()
          expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          id: undefined,
          expectedError: 'Restaurant ID is required'
        },
        {
          id: null,
          expectedError: 'Restaurant ID is required'
        },
        {
          id: '',
          expectedError: 'Restaurant ID is required'
        },
        {
          id: '0',
          expectedError: 'ID must be a positive number'
        },
        {
          id: '-1',
          expectedError: 'ID must be a positive number'
        },
        {
          id: 'abc',
          expectedError: 'ID must be a positive number'
        }
      ])(
        'should call sendValidationError for invalid restaurant ID - id: $id',
        ({ id, expectedError }) => {
          req.params = { id }

          validateRestaurantIdMiddleware(req, res, next)

          expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
            res,
            expectedError
          )
          expect(next).not.toHaveBeenCalled()
        }
      )
    })
  })

  describe('validateReservationIdMiddleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        params: {}
      }
      res = {}
      next = jest.fn()
    })

    describe('valid cases', () => {
      test.each([
        { id: '1' },
        { id: '50' },
        { id: '12345' },
        { id: 1 },
        { id: 100 }
      ])(
        'should call next() for valid reservation ID - id: $id',
        ({ id }) => {
          req.params = { id }

          validateReservationIdMiddleware(req, res, next)

          expect(next).toHaveBeenCalled()
          expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          id: undefined,
          expectedError: 'Reservation ID is required'
        },
        {
          id: null,
          expectedError: 'Reservation ID is required'
        },
        {
          id: '',
          expectedError: 'Reservation ID is required'
        },
        {
          id: '0',
          expectedError: 'ID must be a positive number'
        },
        {
          id: '-5',
          expectedError: 'ID must be a positive number'
        },
        {
          id: 'not-a-number',
          expectedError: 'ID must be a positive number'
        }
      ])(
        'should call sendValidationError for invalid reservation ID - id: $id',
        ({ id, expectedError }) => {
          req.params = { id }

          validateReservationIdMiddleware(req, res, next)

          expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
            res,
            expectedError
          )
          expect(next).not.toHaveBeenCalled()
        }
      )
    })
  })

  describe('validateReservationFiltersMiddleware', () => {
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
          restaurant_id: undefined,
          description: 'no restaurant_id parameter'
        },
        {
          restaurant_id: null,
          description: 'null restaurant_id parameter'
        },
        {
          restaurant_id: '',
          description: 'empty restaurant_id parameter'
        },
        {
          restaurant_id: '1',
          description: 'valid positive number as string'
        },
        {
          restaurant_id: '100',
          description: 'valid large positive number'
        },
        {
          restaurant_id: 1,
          description: 'valid positive number'
        }
      ])(
        'should call next() for valid filter params - $description',
        ({ restaurant_id }) => {
          req.query = { restaurant_id }

          validateReservationFiltersMiddleware(req, res, next)

          expect(next).toHaveBeenCalled()
          expect(responseHandler.sendValidationError).not.toHaveBeenCalled()
        }
      )
    })

    describe('error cases', () => {
      test.each([
        {
          restaurant_id: '0',
          expectedError: 'restaurant_id must be a positive number'
        },
        {
          restaurant_id: '-1',
          expectedError: 'restaurant_id must be a positive number'
        },
        {
          restaurant_id: '-100',
          expectedError: 'restaurant_id must be a positive number'
        },
        {
          restaurant_id: 'invalid',
          expectedError: 'restaurant_id must be a positive number'
        },
        {
          restaurant_id: 'abc123',
          expectedError: 'restaurant_id must be a positive number'
        }
      ])(
        'should call sendValidationError for invalid filter params - restaurant_id: $restaurant_id',
        ({ restaurant_id, expectedError }) => {
          req.query = { restaurant_id }

          validateReservationFiltersMiddleware(req, res, next)

          expect(responseHandler.sendValidationError).toHaveBeenCalledWith(
            res,
            expectedError
          )
          expect(next).not.toHaveBeenCalled()
        }
      )
    })
  })
})
