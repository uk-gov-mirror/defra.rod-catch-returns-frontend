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
/*
 * {
 *   "days": 3,
 *   "_created": "2018-09-06T13:12:47.374+0000",
 *   "_last_modified": "2018-09-06T13:12:47.374+0000",
 *   "_links": {
 *   "self": {
 *     "href": "http://localhost:9580/api/activities/1"
 *   },
 *   "activity": {
 *     "href": "http://localhost:9580/api/activities/1"
 *   },
 *   "submission": {
 *     "href": "http://localhost:9580/api/activities/1/submission"
 *   },
 *   "river": {
 *     "href": "http://localhost:9580/api/activities/1/river"
 *   }
 * }
 */
