const SmallCatchesApi = require('../../src/api/small-catches')
const ActivityApi = require('../../src/api/activities')
const RiversApi = require('../../src/api/rivers')
const MethodsApi = require('../../src/api/methods')
const { monthHelper } = require('../../src/handlers/common')
const ResponseError = require('../../src/handlers/response-error')

jest.mock('../../src/api/activities')
jest.mock('../../src/api/rivers')
jest.mock('../../src/api/methods')
jest.mock('../../src/handlers/common', () => ({
  monthHelper: {
    find: {
      numFromKey: jest.fn(),
      keyFromNum: jest.fn()
    }
  }
}))
jest.mock('../../src/handlers/response-error', () => ({
  status: {
    CONFLICT: 409
  }
}))

describe('small-catches.unit', () => {
  describe('constructor', () => {
    it('maps API response into formatted object', async () => {
      // Arrange: fake mapped dependencies
      const fakeActivity = {
        id: '1',
        days: 3,
        _links: {
          river: {
            href: 'https://local/api/rivers/2'
          },
          self: {
            href: 'https://local/api/activities/1'
          }
        }
      }
      const fakeRiver = {
        id: '2',
        name: 'Avon',
        _links: {
          self: {
            href: 'https://local/api/rivers/2'
          }
        }
      }
      const fakeMethods = [
        { id: 'M1', name: 'Fly', internal: false },
        { id: 'M2', name: 'Spin', internal: true }
      ]

      ActivityApi.prototype.getFromLink.mockResolvedValue(fakeActivity)
      RiversApi.prototype.getFromLink.mockResolvedValue(fakeRiver)
      MethodsApi.prototype.list.mockResolvedValue(fakeMethods)
      MethodsApi.prototype.getFromLink.mockImplementation(async (_req, href) => ({ id: href }))
      MethodsApi.prototype.doMap.mockResolvedValue({ name: 'Fly' })

      monthHelper.find.numFromKey.mockReturnValue(6)

      const input = {
        id: 'C1',
        month: 'JUN',
        released: true,
        noMonthRecorded: false,
        reportingExclude: false,
        counts: [
          { count: 10, _links: { method: { href: 'M1' } } }
        ],
        _links: {
          activity: {
            href: 'https://local/api/activities/1'
          },
          self: {
            href: 'https://local/api/smallCatches/22050'

          }
        }
      }

      const smallCatchesApi = new SmallCatchesApi()

      // Act
      const result = await smallCatchesApi.doMap({}, input)

      // Assert
      expect(result).toEqual({
        id: 'smallCatches/22050',
        month: 6,
        counts: [
          { id: 'M1', name: 'Fly', count: 10, internal: false },
          { id: 'M2', name: 'Spin', count: null, internal: true }
        ],
        reportingExclude: false,
        released: true,
        noMonthRecorded: false,
        activity: {
          id: 'activities/1',
          days: 3,
          river: {
            id: 'rivers/2',
            name: 'Avon'
          }
        }
      })
    })
  })
})
