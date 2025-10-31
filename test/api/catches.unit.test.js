const CatchesApi = require('../../src/api/catches')
const ActivityApi = require('../../src/api/activities')
const RiversApi = require('../../src/api/rivers')
const MethodsApi = require('../../src/api/methods')
const SpeciesApi = require('../../src/api/species')
const EntityApi = require('../../src/api/entity-api')

jest.mock('../../src/api/activities')
jest.mock('../../src/api/rivers')
jest.mock('../../src/api/methods')
jest.mock('../../src/api/species')

describe('catches.unit', () => {
  describe('constructor', () => {
    it('maps API response into formatted object', async () => {
      const mockActivity = {
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
      const mockRiver = {
        id: '2',
        name: 'Avon',
        _links: {
          self: {
            href: 'https://local/api/rivers/2'
          }
        }
      }
      const mockMethod = { id: 'M1', name: 'Fly', internal: false, _links: { self: { href: 'https://local/api/method/1' } } }
      const mockSpecies = { id: 'S1', name: 'Salmon', _links: { self: { href: 'https://local/api/species/1' } } }

      ActivityApi.prototype.getFromLink.mockResolvedValueOnce(mockActivity)
      RiversApi.prototype.getFromLink.mockResolvedValueOnce(mockRiver)
      MethodsApi.prototype.getFromLink.mockResolvedValueOnce(mockMethod)
      SpeciesApi.prototype.getFromLink.mockResolvedValueOnce(mockSpecies)

      const input = {
        id: 'C1',
        dateCaught: '2024-06-24',
        released: true,
        mass: '1',
        days: 2,
        reportingExclude: true,
        onlyMonthRecorded: false,
        noDateRecorded: true,
        _links: {
          activity: {
            href: 'https://local/api/activities/1'
          },
          self: {
            href: 'https://local/api/catches/6'

          },
          river: {
            href: 'https://local/api/rivers/2'
          },
          species: {
            href: 'https://local/api/species/1'
          },
          method: {
            href: 'https://local/api/method/1'
          }
        }
      }

      const catchesApi = new CatchesApi()
      const result = await catchesApi.doMap({}, input)

      expect(result).toEqual(
        {
          activity: {
            days: 3,
            id: 'activities/1',
            river: {
              id: 'rivers/2',
              name: 'Avon'
            }
          },
          dateCaught: '2024-06-24',
          id: 'catches/6',
          mass: '1',
          method: {
            id: 'method/1',
            name: 'Fly'
          },
          noDateRecorded: true,
          onlyMonthRecorded: false,
          released: true,
          reportingExclude: true,
          species: {
            id: 'species/1',
            name: 'Salmon'
          }
        }
      )
    })
  })
})
