'use strict'

const EntityApi = require('./entity-api')
const RiversApi = require('../api/rivers')
const SpeciesApi = require('../api/species')
const MethodsApi = require('../api/methods')

const riversApi = new RiversApi()
const methodsApi = new MethodsApi()
const speciesApi = new SpeciesApi()

/**
 * Catches entity handler
 *
 */
module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('catches', 'catches', async (c) => {
      const river = await riversApi.getFromLink(c._links.river.href)
      const species = await speciesApi.getFromLink(c._links.species.href)
      const method = await methodsApi.getFromLink(c._links.method.href)
      return {
        id: this.keyFromLink(c),
        river: {
          id: this.keyFromLink(river),
          name: river.name
        },
        species: {
          id: this.keyFromLink(species),
          name: species.name
        },
        method: {
          id: this.keyFromLink(method),
          name: method.name
        }
      }
    })
  }

  async add (submissionId, riverId, dateCaught, speciesId, mass, methodId, released) {
    return super.add({
      submission: submissionId,
      river: riverId,
      date_caught: dateCaught,
      species: speciesId,
      mass: mass,
      method: methodId,
      released: released
    })
  }
}
