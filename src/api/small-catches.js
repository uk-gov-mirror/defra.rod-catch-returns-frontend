'use strict'
const Moment = require('moment')

const EntityApi = require('./entity-api')
const ActivityApi = require('../api/activities')
const RiversApi = require('../api/rivers')
const MethodsApi = require('../api/methods')

const activityApi = new ActivityApi()
const riversApi = new RiversApi()
const methodsApi = new MethodsApi()

// Calculate calendar months
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    value: m,
    text: mth.toUpperCase()
  }
})

const mthVal = (o) => months.find(m => m.text === o.month.toUpperCase()).value

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
    super('smallCatches', async (request, c) => {
      const activity = await activityApi.getFromLink(request, c._links.activity.href)
      const river = await riversApi.getFromLink(request, activity._links.river.href)

      const counts = await Promise.all(c.counts.map(async m => {
        return { method: await methodsApi.doMap(request, await methodsApi.getFromLink(request, m._links.method.href)), count: m.count }
      }))

      return {
        id: EntityApi.keyFromLink(c),
        month: c.month,
        counts: counts,
        released: c.released,
        activity: {
          id: EntityApi.keyFromLink(activity),
          days: activity.days,
          river: {
            id: EntityApi.keyFromLink(river),
            name: river.name
          }
        }
      }
    })
  }

  async add (request, submissionId, activityId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list(request)
    return super.add(request, {
      submission: submissionId,
      activity: activityId,
      month: month,
      released: released,
      counts: flatternCounts(methods, fly, spinner, bait)
    })
  }

  async change (request, catchId, submissionId, activityId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list(request)
    const result = await super.change(request, catchId, {
      month: month,
      released: released,
      counts: flatternCounts(methods, fly, spinner, bait)
    })

    const mappedResult = await this.doMap(request, result)

    // Change the activity if necessary
    if (mappedResult.activity.id !== activityId) {
      await super.changeAssoc(request, catchId + '/activity', activityId)
    }
  }

  sort (a, b) {
    if (mthVal(a) < mthVal(b)) {
      return -1
    }

    if (mthVal(a) > mthVal(b)) {
      return 1
    }

    if (a.river.name < b.river.name) {
      return -1
    }

    if (a.river.name > b.river.name) {
      return 1
    }

    return 0
  }
}
