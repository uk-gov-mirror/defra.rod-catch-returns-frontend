'use strict'

const EntityApi = require('./entity-api')
const RiversApi = require('../api/rivers')

const riversApi = new RiversApi()

/**
 * Activities entity handler
 *
 */
module.exports = class ActivitiesApi extends EntityApi {
  constructor () {
    super('activities', async (request, a) => {
      const river = await riversApi.getFromLink(request, a._links.river.href)
      return {
        id: EntityApi.keyFromLink(a),
        days: a.days,
        river: {
          id: EntityApi.keyFromLink(river),
          name: river.name
        }
      }
    })
  }

  async add (request, submissionId, river, days) {
    return super.add(request, {
      submission: submissionId,
      river: river,
      days: days
    })
  }

  async change (request, activityId, submissionId, riverId, days) {
    // Change the days
    const result = await super.change(request, activityId, {
      days: days
    })

    const mappedResult = await this.doMap(request, result)

    // Change the river if necessary
    if (mappedResult.river.id !== riverId) {
      await super.changeAssoc(request, activityId + '/river', riverId)
    }

    return result
  }

  sort (a, b) {
    if (a.river.name < b.river.name) {
      return -1
    }

    if (a.river.name > b.river.name) {
      return 1
    }

    return 0
  }
}
