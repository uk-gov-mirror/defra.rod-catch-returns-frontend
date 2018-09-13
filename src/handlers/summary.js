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
const printWeight = require('./common').printWeight

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
    const cache = await this.clearCacheErrorsAndPayload(request)

    // Find or create a submission object
    let submission = await submissionsApi.getById(cache.submissionId)

    // Set the submissionId in the cache
    cache.submissionId = submission.id
    await request.cache().set(cache)

    // Get the activities
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)

    // If there are no activities go straight to teh activities-add page
    if (!activities.length) {
      return h.redirect('/activities/add')
    }

    // Process the catches for the summary view
    const catches = (await catchesApi.getFromLink(submission._links.catches.href)).map(c => {
      c.dateCaught = Moment(c.dateCaught).format('DD/MM')
      c.weight = printWeight(c)
      return c
    })

    const smallCatches = (await smallCatchesApi.getFromLink(submission._links.smallCatches.href)).map(c => {
      c.month = months.find(m => m.value === c.month).text
      c.river = c.activity.river.name
      c.bait = c.counts.find(c => c.method.name.toLowerCase() === 'bait').count
      c.spinner = c.counts.find(c => c.method.name.toLowerCase() === 'spinner').count
      c.fly = c.counts.find(c => c.method.name.toLowerCase() === 'fly').count
      delete c.counts
      return c
    })

    // Return the summary view
    return h.view(this.path, { year: cache.year, activities, catches, smallCatches })
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
