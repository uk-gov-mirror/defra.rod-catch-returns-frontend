const ActivitiesApi = require('../../src/api/activities')
const EntityApi = require('../../src/api/entity-api')

jest.mock('../../src/api/entity-api')
jest.mock('../../src/api/rivers')

describe('activities', () => {
  beforeEach(jest.clearAllMocks)

  describe('add', () => {
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

  describe('change', () => {
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
