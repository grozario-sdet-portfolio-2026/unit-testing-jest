const controllerHelper = require('../../../src/utils/controllerHelper')
const responseHandler = require('../../../src/utils/responseHandler')

jest.mock('../../../src/utils/responseHandler')

describe('Controller Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ensureResourceExists', () => {
    let res

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnValue({
          json: jest.fn()
        }),
        json: jest.fn()
      }
    })

    describe('resource exists', () => {
      it('should return the resource when it exists', async () => {
        const mockResource = {
          id: 1,
          name: 'Test Resource',
          email: 'test@example.com'
        }
        const getResourceFunction = jest.fn().mockResolvedValue(mockResource)
        const resourceId = 1
        const errorMessage = 'Resource not found'

        const result = await controllerHelper.ensureResourceExists(
          res,
          getResourceFunction,
          resourceId,
          errorMessage
        )

        expect(getResourceFunction).toHaveBeenCalledWith(resourceId)
        expect(result).toEqual(mockResource)
        expect(responseHandler.sendError).not.toHaveBeenCalled()
      })

      test.each([
        {
          resource: { id: 1, title: 'Post 1', content: 'Content' },
          resourceId: 1
        },
        {
          resource: { id: 2, name: 'Restaurant 1', capacity: 100 },
          resourceId: 2
        },
        {
          resource: { id: 100, status: 'active', value: 500 },
          resourceId: 100
        }
      ])(
        'should work with different resource types - id: $resourceId',
        async ({ resource, resourceId }) => {
          const getResourceFunction = jest.fn().mockResolvedValue(resource)
          const errorMessage = 'Resource not found'

          const result = await controllerHelper.ensureResourceExists(
            res,
            getResourceFunction,
            resourceId,
            errorMessage
          )

          expect(getResourceFunction).toHaveBeenCalledWith(resourceId)
          expect(result).toEqual(resource)
          expect(responseHandler.sendError).not.toHaveBeenCalled()
        }
      )
    })

    describe('resource does not exist', () => {
      it('should send 404 error when resource is not found', async () => {
        const getResourceFunction = jest.fn().mockResolvedValue(null)
        const resourceId = 999
        const errorMessage = 'Resource not found'

        const expectedTest = {
          sendErrorParams: [res, 404, errorMessage]
        }

        const result = await controllerHelper.ensureResourceExists(
          res,
          getResourceFunction,
          resourceId,
          errorMessage
        )

        expect(getResourceFunction).toHaveBeenCalledWith(resourceId)
        expect(responseHandler.sendError).toHaveBeenCalledWith(
          ...expectedTest.sendErrorParams
        )
        expect(result).toBeNull()
      })

      it('should return null after sending error when resource not found', async () => {
        const getResourceFunction = jest.fn().mockResolvedValue(null)
        const resourceId = 123
        const errorMessage = 'Item not found'

        const result = await controllerHelper.ensureResourceExists(
          res,
          getResourceFunction,
          resourceId,
          errorMessage
        )

        expect(result).toBeNull()
        expect(responseHandler.sendError).toHaveBeenCalled()
      })

      test.each([
        { errorMessage: 'Restaurant not found' },
        { errorMessage: 'Reservation not found' },
        { errorMessage: 'User not found' }
      ])(
        'should handle different error messages when resource not found - $errorMessage',
        async ({ errorMessage }) => {
          const getResourceFunction = jest.fn().mockResolvedValue(null)
          const resourceId = 1

          await controllerHelper.ensureResourceExists(
            res,
            getResourceFunction,
            resourceId,
            errorMessage
          )

          expect(responseHandler.sendError).toHaveBeenCalledWith(
            res,
            404,
            errorMessage
          )
        }
      )
    })
  })

  describe('mergeResourceData', () => {
    describe('valid merge operations', () => {
      it('should merge all updated fields into existing data', () => {
        const existingData = {
          id: 1,
          name: 'Original Name',
          email: 'original@example.com',
          phone: '123456789'
        }
        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com'
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Updated Name',
          email: 'updated@example.com',
          phone: '123456789'
        })
      })

      it('should preserve existing data not included in update', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com',
          phone: '123',
          address: '123 Street',
          city: 'City'
        }
        const updateData = {
          name: 'New Name'
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'New Name',
          email: 'email@example.com',
          phone: '123',
          address: '123 Street',
          city: 'City'
        })
      })

      it('should not modify the original existing data object', () => {
        const existingData = {
          id: 1,
          name: 'Original Name',
          email: 'original@example.com'
        }
        const existingDataCopy = JSON.parse(JSON.stringify(existingData))
        const updateData = {
          name: 'Updated Name'
        }

        controllerHelper.mergeResourceData(existingData, updateData)

        expect(existingData).toEqual(existingDataCopy)
      })

      it('should handle updates with multiple fields', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com',
          phone: '123',
          status: 'active'
        }
        const updateData = {
          email: 'newemail@example.com',
          phone: '456',
          status: 'inactive'
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Name',
          email: 'newemail@example.com',
          phone: '456',
          status: 'inactive'
        })
      })
    })

    describe('handling undefined and null values', () => {
      it('should ignore undefined values in update data', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com'
        }
        const updateData = {
          name: 'Updated Name',
          email: undefined
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Updated Name',
          email: 'email@example.com'
        })
      })

      it('should ignore null values in update data', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com',
          phone: '123'
        }
        const updateData = {
          name: 'Updated Name',
          email: null,
          phone: '456'
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Updated Name',
          email: 'email@example.com',
          phone: '456'
        })
      })

      it('should handle updates with both undefined and null values', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com',
          phone: '123',
          address: 'Address',
          city: 'City'
        }
        const updateData = {
          name: 'Updated Name',
          email: undefined,
          phone: null,
          address: 'New Address',
          city: undefined
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Updated Name',
          email: 'email@example.com',
          phone: '123',
          address: 'New Address',
          city: 'City'
        })
      })
    })

    describe('edge cases', () => {
      it('should handle empty update data', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com'
        }
        const updateData = {}

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual(existingData)
        expect(result).not.toBe(existingData)
      })

      it('should handle update with only undefined and null values', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          email: 'email@example.com'
        }
        const updateData = {
          name: undefined,
          email: null
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual(existingData)
      })

      it('should handle new fields in update data not in existing data', () => {
        const existingData = {
          id: 1,
          name: 'Name'
        }
        const updateData = {
          email: 'email@example.com',
          phone: '123'
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Name',
          email: 'email@example.com',
          phone: '123'
        })
      })

      it('should handle zero and empty string values as valid updates', () => {
        const existingData = {
          id: 1,
          name: 'Name',
          count: 10,
          description: 'Some text'
        }
        const updateData = {
          count: 0,
          description: ''
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          name: 'Name',
          count: 0,
          description: ''
        })
      })

      it('should handle false and boolean values as valid updates', () => {
        const existingData = {
          id: 1,
          active: true,
          verified: true
        }
        const updateData = {
          active: false,
          verified: false
        }

        const result = controllerHelper.mergeResourceData(
          existingData,
          updateData
        )

        expect(result).toEqual({
          id: 1,
          active: false,
          verified: false
        })
      })
    })
  })
})
