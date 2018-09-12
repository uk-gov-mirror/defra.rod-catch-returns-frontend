'use strict'

const EntityApi = require('./entity-api')
const SubmissionApi = require('../api/submissions')
const RiversApi = require('../api/rivers')

const submissionApi = new SubmissionApi()
const riversApi = new RiversApi()

/**
 * Activities entity handler
 *
 */

module.exports = class ActivitiesApi extends EntityApi {
  constructor () {
    super('activities', async (a) => {
      const river = await riversApi.getFromLink(a._links.river.href)
      const submission = await submissionApi.getFromLink(a._links.submission.href)
      return {
        id: this.keyFromLink(a),
        days: a.days,
        river: {
          id: this.keyFromLink(river),
          name: river.name
        },
        submissionId: submissionApi.keyFromLink(submission)
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
}