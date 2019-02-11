'use strict'

/**
 * Summary handler
 */
const Moment = require('moment')
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const SmallCatchesApi = require('../api/small-catches')
const ActivitiesApi = require('../api/activities')

const { printWeight, testLocked } = require('./common')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const smallCatchesApi = new SmallCatchesApi()
const activitiesApi = new ActivitiesApi()

// Calculate calendar months
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    value: mth.toUpperCase(),
    text: mth
  }
})

module.exports = class SummaryHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for the summary page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    // Clean the cache
    const cache = await SummaryHandler.clearCacheErrorsAndPayload(request)

    // Find or create a submission object
    let submission = await submissionsApi.getById(request, cache.submissionId)

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    // Set the submissionId in the cache
    cache.submissionId = submission.id
    cache.back = request.path
    await request.cache().set(cache)

    // Get the activities
    const activities = await activitiesApi.getFromLink(request, submission._links.activities.href)

    // Add a count to the activities
    activities.map(a => { a.count = 0 })

    // Process the catches for the summary view
    const catches = (await catchesApi.getFromLink(request, submission._links.catches.href)).map(c => {
      c.dateCaught = Moment(c.dateCaught).format('DD/MM')
      c.weight = printWeight(c)
      const activity = activities.find(a => a.id === c.activity.id)
      activity.count++
      return c
    })

    // Need to show the unknown method if set by the administrator
    let foundInternal = false

    // Process the small catches flattening the counts
    const smallCatches = (await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)).map(c => {
      c.month = months.find(m => m.value === c.month).text
      c.river = c.activity.river.name
      const activity = activities.find(a => a.id === c.activity.id)
      c.counts.forEach(t => {
        c[t.name.toLowerCase()] = t.count
        activity.count += t.count || 0
      })
      foundInternal = foundInternal || !!c.counts.find(m => m.internal)
      delete c.counts
      return c
    })

    // Return the summary view
    return h.view(this.path, {
      year: cache.year,
      activities: activities.sort(activitiesApi.sort),
      catches: catches.sort(catchesApi.sort),
      smallCatches: smallCatches.sort(smallCatchesApi.sort),
      reportingExclude: submission.reportingExclude,
      foundInternal: foundInternal,
      details: {
        licenceNumber: cache.licenceNumber,
        postcode: cache.postcode,
        year: cache.year
      }
    })
  }

  /**
   * Post handler for the summary page. In the case of the FMT user the
   * exclusions need to be saved, otherwise just progress to the review page
   * @param request. No validation is required
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    if (process.env.CONTEXT === 'FMT') {
      await this.exclusions(request)

      if (Object.keys(request.payload).includes('save')) {
        return h.redirect('/save')
      }
    }

    return h.redirect('/review')
  }

  async exclusions (request) {
    const cache = await request.cache().get()
    const submission = await submissionsApi.getById(request, cache.submissionId)

    // Process the payload
    const smallCatchExclusions = request.payload['exclude-small-catch']
      ? request.payload['exclude-small-catch'].split(',')
      : null
    const catchExclusions = request.payload['exclude-catch']
      ? request.payload['exclude-catch'].split(',')
      : null

    // Get the small and large catches
    const catches = await catchesApi.getFromLink(request, submission._links.catches.href)
    const smallCatches = await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)

    // Change the submission level exclusion if necessary
    if (Object.keys(request.payload).includes('exclude')) {
      if (!submission.reportingExclude) {
        await submissionsApi.changeExclusion(request, submission.id, true)
      }
    } else {
      if (submission.reportingExclude) {
        await submissionsApi.changeExclusion(request, submission.id, false)
      }
    }

    // Change the large catch exclusions where necessary
    await Promise.all(catches.map(async c => {
      if (catchExclusions && catchExclusions.find(e => e === c.id)) {
        if (!c.reportingExclude) {
          await catchesApi.changeExclusion(request, c.id, true)
        }
      } else {
        if (c.reportingExclude) {
          await catchesApi.changeExclusion(request, c.id, false)
        }
      }
    }))

    // Change the small catch exclusions where necessary
    await Promise.all(smallCatches.map(async c => {
      if (smallCatchExclusions && smallCatchExclusions.find(e => e === c.id)) {
        if (!c.reportingExclude) {
          await smallCatchesApi.changeExclusion(request, c.id, true)
        }
      } else {
        if (c.reportingExclude) {
          await smallCatchesApi.changeExclusion(request, c.id, false)
        }
      }
    }))
  }
}
