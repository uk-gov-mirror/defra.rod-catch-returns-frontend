'use strict'

const EntityApi = require('./entity-api')
const ActivityApi = require('../api/activities')
const RiversApi = require('../api/rivers')
const MethodsApi = require('../api/methods')
const SpeciesApi = require('../api/species')

const activityApi = new ActivityApi()
const riversApi = new RiversApi()
const methodsApi = new MethodsApi()
const speciesApi = new SpeciesApi()

/**
 * Catches entity handler
 *
 */
module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('catches', async (c) => {
      const activity = await activityApi.getFromLink(c._links.activity.href)
      const river = await riversApi.getFromLink(activity._links.river.href)
      const species = await speciesApi.getFromLink(c._links.species.href)
      const method = await methodsApi.getFromLink(c._links.method.href)
      return {
        id: this.keyFromLink(c),
        dateCaught: c.dateCaught,
        released: c.released,
        mass: c.mass,
        activity: {
          id: activityApi.keyFromLink(activity),
          days: activity.days,
          river: {
            id: riversApi.keyFromLink(river),
            name: river.name
          }
        },
        species: {
          id: speciesApi.keyFromLink(species),
          name: species.name
        },
        method: {
          id: methodsApi.keyFromLink(method),
          name: method.name
        }
      }
    })
  }

  async add (submissionId, activityId, dateCaught, speciesId, mass, methodId, released) {
    return super.add({
      submission: submissionId,
      activity: activityId,
      dateCaught: dateCaught,
      species: speciesId,
      mass: mass,
      method: methodId,
      released: released
    })
  }

  async change (catchId, submissionId, activityId, dateCaught, speciesId, mass, methodId, released) {
    const result = await super.change(catchId, {
      dateCaught: dateCaught,
      mass: mass,
      released: released
    })

    const mappedResult = await this.doMap(result)

    // Change the activity if necessary
    if (mappedResult.activity.id !== activityId) {
      await super.changeAssoc(catchId + '/activity', activityId)
    }

    // Change the activity if necessary
    if (mappedResult.species.id !== speciesId) {
      await super.changeAssoc(catchId + '/species', speciesId)
    }

    // Change the activity if necessary
    if (mappedResult.method.id !== methodId) {
      await super.changeAssoc(catchId + '/method', methodId)
    }

    return result
  }
}
