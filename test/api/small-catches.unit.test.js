const SmallCatchesApi = require('../../src/api/small-catches')
const ActivityApi = require('../../src/api/activities')
const RiversApi = require('../../src/api/rivers')
const MethodsApi = require('../../src/api/methods')
const EntityApi = require('../../src/api/entity-api')
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
      const result = await smallCatchesApi.doMap({}, input)

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

  describe('add', () => {
    it('calls super.add with converted month and correct payload', async () => {
      const superAddMock = EntityApi.prototype.add = jest.fn()
      monthHelper.find.keyFromNum.mockReturnValue('APR')
      const request = {}

      const smallCatchesApi = new SmallCatchesApi()
      await smallCatchesApi.add(request, 'sub-1', 'act-1', 4, [{ c: 1 }], true, false)

      expect(superAddMock).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          submission: 'sub-1',
          activity: 'act-1',
          month: 'APR',
          released: true,
          counts: [{ c: 1 }],
          noMonthRecorded: false
        })
      )
    })
  })

  describe('change', () => {
    it('returns result immediately when super.change returns errors', async () => {
      EntityApi.prototype.change = jest.fn().mockResolvedValue({
        errors: ['something bad']
      })

      const smallCatchesApi = new SmallCatchesApi()
      const result = await smallCatchesApi.change({}, 'C1', 'A1', 4, [], false, false)

      expect(result).toEqual({ errors: ['something bad'] })
    })

    it('changes association if mapped activity differs', async () => {
      EntityApi.prototype.change = jest.fn().mockResolvedValue({ id: 'C1' })
      const request = {}
      EntityApi.prototype.changeAssoc = jest.fn().mockResolvedValue({})
      const smallCatchesApi = new SmallCatchesApi()
      smallCatchesApi.doMap = jest.fn().mockResolvedValue({
        activity: { id: 'A2' }
      })

      await smallCatchesApi.change(request, 'C1', 'A1', 9, [], false, false)

      expect(EntityApi.prototype.changeAssoc).toHaveBeenCalledWith(request, 'C1/activity', 'A1')
    })

    it('returns duplicate error on conflict when changing association', async () => {
      EntityApi.prototype.change = jest.fn().mockResolvedValue({ id: 'C1' })
      EntityApi.prototype.changeAssoc = jest.fn().mockResolvedValue({ statusCode: ResponseError.status.CONFLICT })
      const smallCatchesApi = new SmallCatchesApi()
      smallCatchesApi.doMap = jest.fn().mockResolvedValue({
        activity: { id: 'A2' }
      })

      const result = await smallCatchesApi.change({}, 'C1', 'A1', 9, [], false, false)

      expect(result).toEqual({
        errors: [
          {
            entity: 'SmallCatch',
            message: 'SMALL_CATCH_DUPLICATE_FOUND'
          }
        ]
      })
    })
  })

  describe('changeExclusion', () => {
    it('calls super.change with reportingExclude', async () => {
      EntityApi.prototype.change = jest.fn()
      const request = {}

      const smallCatchesApi = new SmallCatchesApi()
      await smallCatchesApi.changeExclusion(request, 'C1', true)

      expect(EntityApi.prototype.change).toHaveBeenCalledWith(
        request,
        'C1',
        { reportingExclude: true }
      )
    })
  })

  describe('sort', () => {
    it('returns -1 when a.month < b.month', () => {
      const a = { month: 1, noMonthRecorded: false, activity: { river: { name: 'A' } } }
      const b = { month: 2, noMonthRecorded: false, activity: { river: { name: 'B' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(-1)
    })

    it('returns 1 when a.month > b.month', () => {
      const a = { month: 5, noMonthRecorded: false, activity: { river: { name: 'A' } } }
      const b = { month: 3, noMonthRecorded: false, activity: { river: { name: 'B' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(1)
    })

    it('returns -1 when months equal and a.noMonthRecorded < b.noMonthRecorded', () => {
      const a = { month: 6, noMonthRecorded: false, activity: { river: { name: 'A' } } }
      const b = { month: 6, noMonthRecorded: true, activity: { river: { name: 'B' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(-1)
    })

    it('returns 1 when months equal and a.noMonthRecorded > b.noMonthRecorded', () => {
      const a = { month: 6, noMonthRecorded: true, activity: { river: { name: 'A' } } }
      const b = { month: 6, noMonthRecorded: false, activity: { river: { name: 'B' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(1)
    })

    it('returns -1 when months + noMonthRecorded equal and river name a < b', () => {
      const a = { month: 6, noMonthRecorded: false, activity: { river: { name: 'Amazon' } } }
      const b = { month: 6, noMonthRecorded: false, activity: { river: { name: 'Zambezi' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(-1)
    })

    it('returns 1 when months + noMonthRecorded equal and river name a > b', () => {
      const a = { month: 6, noMonthRecorded: false, activity: { river: { name: 'Zambezi' } } }
      const b = { month: 6, noMonthRecorded: false, activity: { river: { name: 'Amazon' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(1)
    })

    it('returns 0 when all compared fields are equal', () => {
      const a = { month: 7, noMonthRecorded: false, activity: { river: { name: 'Nile' } } }
      const b = { month: 7, noMonthRecorded: false, activity: { river: { name: 'Nile' } } }

      const smallCatchesApi = new SmallCatchesApi()
      expect(smallCatchesApi.sort(a, b)).toBe(0)
    })
  })
})
