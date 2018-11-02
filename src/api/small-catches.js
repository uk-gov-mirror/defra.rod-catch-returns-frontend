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
module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('smallCatches', async (request, c) => {
      const activity = await activityApi.getFromLink(request, c._links.activity.href)
      const river = await riversApi.getFromLink(request, activity._links.river.href)
      const methods = await methodsApi.list(request)
      const counts = await Promise.all(c.counts.map(async m => {
        return {
          method: await methodsApi.doMap(request, await methodsApi.getFromLink(request, m._links.method.href)), count: m.count
        }
      }))
      return {
        id: EntityApi.keyFromLink(c),
        month: c.month,
        counts: methods.map(m => {
          const methodCount = counts.find(c => c.method.name === m.name)
          return { id: m.id, name: m.name, count: methodCount ? methodCount.count : null }
        }),
        reportingExclude: c.reportingExclude,
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

  async add (request, submissionId, activityId, month, counts, released) {
    return super.add(request, {
      submission: submissionId,
      activity: activityId,
      month: month,
      released: released,
      counts: counts
    })
  }

  async change (request, catchId, activityId, month, counts, released) {
    const result = await super.change(request, catchId, {
      month: month,
      released: released,
      counts: counts
    })

    const mappedResult = await this.doMap(request, result)

    // Change the activity if necessary
    if (mappedResult.activity.id !== activityId) {
      await super.changeAssoc(request, catchId + '/activity', activityId)
    }
  }

  async changeExclusion (request, catchId, reportingExclude) {
    return super.change(request, catchId, {
      reportingExclude: reportingExclude
    })
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
