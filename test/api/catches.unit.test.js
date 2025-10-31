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
    })
  })
})
