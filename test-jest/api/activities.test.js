const mockGetFromLink = jest.fn()
const mockRequest = jest.fn()
const ActivitiesApi = require('../../src/api/activities')

jest.mock('../../src/api/rivers', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getFromLink: mockGetFromLink
    }
  })
})

jest.mock('../../src/api/client', () => {
  const originalModule = jest.requireActual('../../src/api/client')
  return {
    ...originalModule,
    request: mockRequest
  }
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
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href }))
      expect(mapped.id).toEqual(expectedValue)
    })

    it.each([
      [1, 1],
      [10, 10],
      [0, 0]
    ])('sets days fished with no release', async (daysFished, expectedValue) => {
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: 'http://example.com/path/to/somewhere' } } }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href: 'http://example.com/path/to/somewhere', daysFishedOther: daysFished }))
      expect(mapped.daysFishedOther).toEqual(expectedValue)
    })

    it.each([
      [1, 1],
      [10, 10],
      [0, 0]
    ])('sets days fished with mand release', async (daysFishedMand, expectedValue) => {
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: 'http://example.com/path/to/somewhere' } } }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href: 'http://example.com/path/to/somewhere', daysFishedWithMandatoryRelease: daysFishedMand }))
      expect(mapped.daysFishedWithMandatoryRelease).toEqual(expectedValue)
    })

    it.each([
      ['http://example.com/path/to/somewhere', '/path', 'to/somewhere'],
      ['http://example.com/unwise/path/to/the/dark/side', 'the', '/unwise/path/to/dark/side'],
      ['http://example.com/unwise/path/to/the/dark/side/', 'side', '/unwise/path/to/the/dark/']
    ])('sets river id to correct value', async (href, apiPath, expectedValue) => {
      process.env.API_PATH = apiPath
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: href } } }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href }))
      expect(mapped.river.id).toEqual(expectedValue)
    })

    it.each([
      ['Tyne', 'Tyne'],
      ['Barry', 'Barry'],
      ['Usk', 'Usk']
    ])('sets river name value', async (riverName, expectedValue) => {
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: 'http://example.com/path/to/somewhere' } }, name: riverName }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href: 'http://example.com/path/to/somewhere', riverName }))
      expect(mapped.river.name).toEqual(expectedValue)
    })

    it.each([
      ['Tyne', 'Tyne'],
      ['Barry', 'Barry'],
      ['Usk', 'Usk']
    ])('sets river internal value', async (riverInternal, expectedValue) => {
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: 'http://example.com/path/to/somewhere' } }, internal: riverInternal }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href: 'http://example.com/path/to/somewhere', riverInternal }))
      expect(mapped.river.internal).toEqual(expectedValue)
    })

    it.each([
      ['http://example.com/path/to/somewhere', '/path', 'Tyne', 'Tyne', 'internal', 'internal'],
      ['http://example.com/unwise/path/to/the/dark/side', 'the', 'Tyne', 'Tyne', 'internal', 'internal'],
      ['http://example.com/unwise/path/to/the/dark/side/', 'side', 'Tyne', 'Tyne', 'internal', 'internal']
    ])('sets the _links attribute values id, name and internal', async (href, apiPath, name, nameExpectedValue, internal, internalExpectedValue) => {
      process.env.API_PATH = apiPath
      const activitiesApi = new ActivitiesApi()
      mockGetFromLink.mockImplementationOnce(() => ({ _links: { self: { href: href } } }))
      const mapped = await activitiesApi.doMap(({ }), createMockContext({ href, name, internal }))
      expect(mapped._links.river.href).toEqual(href)
      expect(mapped._links.river.name).toEqual(nameExpectedValue)
      expect(mapped._links.river.internal).toEqual(internalExpectedValue)
      expect(mapped._links.self.href).toEqual(href)
    })
  })

  describe('add', () => {
    it('should display the authentication page', async () => {
      const activitiesApi = new ActivitiesApi()
      const request = {
        cache: () => ({
          get: jest.fn(() => ({ authorization: null }))
        })
      }
      const href = 'http://example.com/path/to/somewhere'
      const submissionId = '1'
      const river = 'Goyt'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1
      mockRequest.mockImplementationOnce(() => ({ id: '1', _links: { self: { href: href } }, river, daysFishedOther, daysFishedWithMandatoryRelease }))
      const result = await activitiesApi.add(request, { submissionId, river, daysFishedWithMandatoryRelease, daysFishedOther })
      expect(result.id).toEqual('/path/to/somewhere')
      expect(result.daysFishedOther).toEqual(daysFishedOther)
      expect(result.daysFishedWithMandatoryRelease).toEqual(daysFishedWithMandatoryRelease)
      expect(result.river).toEqual(river)
    })

    it('should display error if there is an error', async () => {
      const activitiesApi = new ActivitiesApi()
      const request = {
        cache: () => ({
          get: jest.fn(() => ({ authorization: null }))
        })
      }
      const errors = 'errors'
      const href = 'http://example.com/path/to/somewhere'
      const submissionId = '1'
      const river = 'Goyt'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1
      mockRequest.mockImplementationOnce(() => ({ id: 1, errors, _links: { self: { href: href } }, river, daysFishedOther, daysFishedWithMandatoryRelease }))
      const result = await activitiesApi.add(request, { submissionId, river, daysFishedWithMandatoryRelease, daysFishedOther })
      expect(result.id).toEqual(1)
    })
  })

  describe('change', () => {
    it('should change the days', async () => {
      const activitiesApi = new ActivitiesApi()
      const request = {
        cache: () => ({
          get: jest.fn(() => ({ authorization: null }))
        })
      }
      const href = 'http://example.com/path/to/somewhere'
      const activityId = '1'
      const submissionId = '1'
      const riverId = '1'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1
      mockRequest.mockImplementationOnce(() => ({ id: '1', _links: { self: { href: href } }, activityId, riverId, daysFishedOther, daysFishedWithMandatoryRelease }))
      const result = await activitiesApi.change(request, { submissionId, activityId, riverId, daysFishedWithMandatoryRelease, daysFishedOther })
      expect(result.id).toEqual('/path/to/somewhere')
      expect(result.activityId).toEqual(activityId)
      expect(result.daysFishedOther).toEqual(daysFishedOther)
      expect(result.daysFishedWithMandatoryRelease).toEqual(daysFishedWithMandatoryRelease)
      expect(result.riverId).toEqual(riverId)
    })

    it('should display error if there is an error', async () => {
      const activitiesApi = new ActivitiesApi()
      const request = {
        cache: () => ({
          get: jest.fn(() => ({ authorization: null }))
        })
      }
      const errors = 'errors'
      const href = 'http://example.com/path/to/somewhere'
      const activityId = '1'
      const submissionId = '1'
      const riverId = '1'
      const daysFishedWithMandatoryRelease = 1
      const daysFishedOther = 1
      mockRequest.mockImplementationOnce(() => ({ id: 1, errors, _links: { self: { href: href } }, activityId, riverId, daysFishedOther, daysFishedWithMandatoryRelease }))
      const result = await activitiesApi.change(request, { submissionId, activityId, riverId, daysFishedWithMandatoryRelease, daysFishedOther })
      expect(result.id).toEqual(1)
    })
  })

  describe('sort', () => {
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
  const { href, daysFishedOther, daysFishedWithMandatoryRelease, name, riverName, internal } = {
    href: 'http://example.com/path/to/somewhere',
    daysFishedOther: 0,
    daysFishedWithMandatoryRelease: 0,
    name: 'river',
    riverName: 'a river',
    internal: 'internal',
    ...params
  }
  return {
    href,
    daysFishedOther,
    daysFishedWithMandatoryRelease,
    river: {
      href,
      riverName,
      internal
    },
    _links: {
      river: {
        href,
        name,
        internal
      },
      self: {
        href
      }
    }
  }
}
