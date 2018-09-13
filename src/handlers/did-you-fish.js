'use strict'

/**
 * Delete Activity Handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')

const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()

module.exports = class DidYouFishHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for delete activity page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await this.clearCacheErrorsAndPayload(request)

    // Find or create a submission object
    let submission = await submissionsApi.getByContactIdAndYear(cache.contactId, cache.year)

    if (!submission) {
      submission = await submissionsApi.add(cache.contactId, cache.year)
    }

    // Set the submissionId in the cache
    cache.submissionId = submission.id
    await request.cache().set(cache)

    // If we have any activity go straight to the summary screen
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)

    // If there are no activities go straight to teh activities-add page
    if (activities.length) {
      return h.redirect('/summary')
    }

    // Display the view
    return this.readCacheAndDisplayView(request, h, {
      year: cache.year
    })
  }

  /**
   * Post handler for the delete activity page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    if (!errors) {
      if (request.payload.dyf === 'NO') {
        return h.redirect('/review')
      } else {
        return h.redirect('/summary')
      }
    }

    return this.writeCacheAndRedirect(request, h, errors, '/summary', this.path)
  }
}
