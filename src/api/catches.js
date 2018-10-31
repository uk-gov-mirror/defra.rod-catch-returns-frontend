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
    super('catches', async (request, c) => {
      const activity = await activityApi.getFromLink(request, c._links.activity.href)
      const river = await riversApi.getFromLink(request, activity._links.river.href)
      const species = await speciesApi.getFromLink(request, c._links.species.href)
      const method = await methodsApi.getFromLink(request, c._links.method.href)
      return {
        id: EntityApi.keyFromLink(c),
        dateCaught: c.dateCaught,
        released: c.released,
        mass: c.mass,
        reportingExclude: c.reportingExclude,
        activity: {
          id: EntityApi.keyFromLink(activity),
          days: activity.days,
          river: {
            id: EntityApi.keyFromLink(river),
            name: river.name
          }
        },
        species: {
          id: EntityApi.keyFromLink(species),
          name: species.name
        },
        method: {
          id: EntityApi.keyFromLink(method),
          name: method.name
        }
      }
    })
  }

  async add (request, submissionId, activityId, dateCaught, speciesId, mass, methodId, released) {
    return super.add(request, {
      submission: submissionId,
      activity: activityId,
      dateCaught: dateCaught,
      species: speciesId,
      mass: mass,
      method: methodId,
      released: released
    })
  }

  async change (request, catchId, submissionId, activityId, dateCaught, speciesId, mass, methodId, released) {
    const result = await super.change(request, catchId, {
      dateCaught: dateCaught,
      mass: mass,
      released: released
    })

    const mappedResult = await this.doMap(request, result)

    // Change the activity if necessary
    if (mappedResult.activity.id !== activityId) {
      await super.changeAssoc(request, catchId + '/activity', activityId)
    }

    // Change the activity if necessary
    if (mappedResult.species.id !== speciesId) {
      await super.changeAssoc(request, catchId + '/species', speciesId)
    }

    // Change the activity if necessary
    if (mappedResult.method.id !== methodId) {
      await super.changeAssoc(request, catchId + '/method', methodId)
    }

    return result
  }

  sort (a, b) {
    if (a.dateCaught < b.dateCaught) {
      return -1
    }

    if (a.dateCaught > b.dateCaught) {
      return 1
    }

    if (a.activity.river.name < b.activity.river.name) {
      return -1
    }

    if (a.activity.river.name > b.activity.river.name) {
      return 1
    }

    return 0
  }
}
