const mockGetFromLink = jest.fn()
const ActivitiesApi = require('../../src/api/activities')
const EntityApi = require('../../src/api/entity-api')
const RiversApi = require('../../src/api/rivers')


jest.mock('../../src/api/rivers', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getFromLink: mockGetFromLink
    }
  })
})

describe('activities', () => {
  beforeEach(jest.clearAllMocks)

  it('sets path to "activities"', () => {
    const activitiesApi = new ActivitiesApi()
    expect(activitiesApi.path).toEqual('activities')
  })

  describe('mapper', () => {
    it.each([
      ['http://example.com/path/to/somewhere', '/path', 'to/somewhere'],
      ['http://example.com/unwise/path/to/the/dark/side', 'the', '/unwise/path/to/dark/side'],
      ['http://example.com/unwise/path/to/the/dark/side/', 'side', '/unwise/path/to/the/dark/']
    ])('sets id properly', async (href, apiPath, expectedValue) => {
      process.env.API_PATH = apiPath
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: href } } }))
      const mapped = await activitiesApi.doMap(createMockContext({ href }), createMockRiver({ href }))
      expect(mapped.id).toBe(expectedValue)
    })
  })

  describe.skip('add', () => {
    it('should display the authentication page', async () => {
      const activitiesApi = new ActivitiesApi()

      const request = {}
      const submissionId = '1'
      const river = 'Goyt'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1

      await activitiesApi.add(request, submissionId, river, daysFishedWithMandatoryRelease, daysFishedOther)
      expect(EntityApi.prototype.add).toBeCalledWith(request, {
        submission: submissionId, river, daysFishedWithMandatoryRelease, daysFishedOther
      })
    })
  })

  describe.skip('change', () => {
    it('should change the days', async () => {
      const activitiesApi = new ActivitiesApi()
      const request = {}
      const activityId = '1'
      const submissionId = '1'
      const riverId = '1'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1

      await activitiesApi.change(request, activityId, submissionId, riverId, daysFishedWithMandatoryRelease, daysFishedOther)
      expect(EntityApi.prototype.change).toBeCalledWith(request, activityId, {
        daysFishedWithMandatoryRelease: daysFishedWithMandatoryRelease,
        daysFishedOther: daysFishedOther,
        river: riverId
      })
    })
  })

  describe.skip('sort', () => {
    it('if in alphabetical order should not change', async () => {
      const activitiesApi = new ActivitiesApi()
      const a = {
        river: {
          name: 'a test'
        }
      }
      const b = {
        river: {
          name: 'b test'
        }
      }

      const result = await activitiesApi.sort(a, b)
      expect(result).toEqual(-1)
    })

    it('if not in alphabetical order should rearrange', async () => {
      const activitiesApi = new ActivitiesApi()
      const a = {
        river: {
          name: 'b test'
        }
      }
      const b = {
        river: {
          name: 'a test'
        }
      }

      const result = await activitiesApi.sort(a, b)
      expect(result).toEqual(1)
    })

    it('if same river they should not be rearranged', async () => {
      const activitiesApi = new ActivitiesApi()
      const a = {
        river: {
          name: 'a test'
        }
      }
      const b = {
        river: {
          name: 'a test'
        }
      }

      const result = await activitiesApi.sort(a, b)
      expect(result).toEqual(0)
    })
  })
})

const createMockContext = params => {
  const { href, daysFishedOther, daysFishedWithMandatoryRelease } = {
    href: '/path/to/somewhere',
    daysFishedOther: 0,
    daysFishedWithMandatoryRelease: 0,
    ...params
  }
  return {
    _links: {
      self: {
        href
      }
    },
    daysFishedOther,
    daysFishedWithMandatoryRelease
  }
}

const createMockRiver = params => {
  const { href, daysFishedOther, daysFishedWithMandatoryRelease } = {
    href: '/path/to/somewhere',
    daysFishedOther: 0,
    daysFishedWithMandatoryRelease: 0,
    ...params
  }
  return {
    _links: {
      river: {
        href
      },
      self: {
        href
      }
    },
    daysFishedOther,
    daysFishedWithMandatoryRelease
  }
}
