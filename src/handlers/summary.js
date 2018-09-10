'use strict'

/**
 * Summary handler
 */
const Moment = require('moment')
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const ActivitiesApi = require('../api/activities')
const printWeight = require('./common').printWeight
const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const activitiesApi = new ActivitiesApi()

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
    await this.clearCacheErrorsAndPayload(request)
    const cache = await request.cache().get()

    // Find or create a submission object
    let submission = await submissionsApi.getByContactIdAndYear(cache.contactId, cache.year)

    if (!submission) {
      submission = await submissionsApi.add(cache.contactId, cache.year)
    }

    // Set the submissionId in the cache
    cache.submissionId = submission.id
    await request.cache().set(cache)

    // Get the activities
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)

    // Process the catches for the summary view
    const catches = (await catchesApi.getFromLink(submission._links.catches.href)).map(c => {
      c.dateCaught = Moment(c.dateCaught).format('DD/MM')
      c.weight = printWeight(c)
      return c
    })

    // Return the summary view
    return h.view(this.path, { year: cache.year, activities, catches })
  }

  /**
   * Post handler for the summary page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    return h.redirect('/submission')
  }
}
