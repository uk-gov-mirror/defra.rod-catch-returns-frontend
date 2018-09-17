'use strict'

const EntityApi = require('./entity-api')
const ActivityApi = require('../api/activities')
const RiversApi = require('../api/rivers')
const MethodsApi = require('../api/methods')

const activityApi = new ActivityApi()
const riversApi = new RiversApi()
const methodsApi = new MethodsApi()

/**
 * Small catches entity handler
 *
 */

const flatternCounts = (methods, fly, spinner, bait) => {
  const result = []

  if (fly > 0) {
    result.push({
      method: methods.find(m => m.name.toLowerCase() === 'fly').id,
      count: fly
    })
  }

  if (bait > 0) {
    result.push({
      method: methods.find(m => m.name.toLowerCase() === 'bait').id,
      count: bait
    })
  }

  if (spinner > 0) {
    result.push({
      method: methods.find(m => m.name.toLowerCase() === 'spinner').id,
      count: spinner
    })
  }

  return result
}

module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('smallCatches', async (c) => {
      const activity = await activityApi.getFromLink(c._links.activity.href)
      const river = await riversApi.getFromLink(activity._links.river.href)

      const counts = await Promise.all(c.counts.map(async m => {
        return { method: await methodsApi.doMap(await methodsApi.getFromLink(m._links.method.href)), count: m.count }
      }))

      return {
        id: this.keyFromLink(c),
        month: c.month,
        counts: counts,
        released: c.released,
        activity: {
          id: activityApi.keyFromLink(activity),
          days: activity.days,
          river: {
            id: riversApi.keyFromLink(river),
            name: river.name
          }
        }
      }
    })
  }

  async add (submissionId, activityId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list()
    return super.add({
      submission: submissionId,
      activity: activityId,
      month: month,
      released: released,
      counts: flatternCounts(methods, fly, spinner, bait)
    })
  }

  async change (catchId, submissionId, activityId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list()
    const result = await super.change(catchId, {
      month: month,
      released: released,
      counts: flatternCounts(methods, fly, spinner, bait)
    })

    const mappedResult = await this.doMap(result)

    // Change the activity if necessary
    if (mappedResult.activity.id !== activityId) {
      await super.changeAssoc(catchId + '/activity', activityId)
    }
  }
}
