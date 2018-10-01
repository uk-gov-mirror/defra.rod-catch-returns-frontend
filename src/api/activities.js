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
    super('activities', async (a) => {
      const river = await riversApi.getFromLink(a._links.river.href)
      return {
        id: this.keyFromLink(a),
        days: a.days,
        river: {
          id: this.keyFromLink(river),
          name: river.name
        }
      }
    })
  }

  async add (submissionId, river, days) {
    return super.add({
      submission: submissionId,
      river: river,
      days: days
    })
  }

  async change (activityId, submissionId, riverId, days) {
    // Change the days
    const result = await super.change(activityId, {
      days: days
    })

    const mappedResult = await this.doMap(result)

    // Change the river if necessary
    if (mappedResult.river.id !== riverId) {
      await super.changeAssoc(activityId + '/river', riverId)
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
