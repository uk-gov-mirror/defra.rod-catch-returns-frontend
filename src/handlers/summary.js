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

    const smallCatches = (await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)).map(c => {
      c.month = months.find(m => m.value === c.month).text
      c.river = c.activity.river.name

      const flyCount = c.counts.find(c => c.method.name.toLowerCase() === 'fly')
      c.fly = flyCount ? flyCount.count : null

      const baitCount = c.counts.find(c => c.method.name.toLowerCase() === 'bait')
      c.bait = baitCount ? baitCount.count : null

      const spinnerCount = c.counts.find(c => c.method.name.toLowerCase() === 'spinner')
      c.spinner = spinnerCount ? spinnerCount.count : null

      const activity = activities.find(a => a.id === c.activity.id)
      activity.count = activity.count + (flyCount ? flyCount.count : 0)
      activity.count = activity.count + (baitCount ? baitCount.count : 0)
      activity.count = activity.count + (spinnerCount ? spinnerCount.count : 0)

      delete c.counts
      return c
    })

    // Return the summary view
    return h.view(this.path, { year: cache.year,
      activities: activities.sort(activitiesApi.sort),
      catches: catches.sort(catchesApi.sort),
      smallCatches: smallCatches.sort(smallCatchesApi.sort),
      details: {
        licenceNumber: cache.licenceNumber,
        postcode: cache.postcode,
        year: cache.year
      }
    })
  }

  /**
   * Post handler for the summary page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    return h.redirect('/review')
  }
}
