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
    super('activities', 'activities', async (a) => {
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
}