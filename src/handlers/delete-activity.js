'use strict'

/**
 * Delete Activity Handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const RiversApi = require('../api/rivers')
const ResponseError = require('./response-error')

const testLocked = require('./common').testLocked
const isAllowedParam = require('./common').isAllowedParam

const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()
const riversApi = new RiversApi()

module.exports = class DeleteActivityHandler extends BaseHandler {
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
    if (!isAllowedParam(request.params.id)) {
      throw new ResponseError.Error('Unknown activity', ResponseError.status.UNAUTHORIZED)
    }

    const activityId = `activities/${request.params.id}`
    const activity = await activitiesApi.getById(request, activityId)

    if (!activity) {
      throw new ResponseError.Error('Unauthorized access to activity', ResponseError.status.UNAUTHORIZED)
    }

    const river = await riversApi.getFromLink(request, activity._links.river.href)

    // Check they are not messing about with somebody else's submission
    const submission = await submissionsApi.getFromLink(request, activity._links.submission.href)
    const cache = await request.cache().get()

    if (cache.submissionId !== submission.id) {
      throw new ResponseError.Error('Unauthorized access to activity', ResponseError.status.UNAUTHORIZED)
    }

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    cache.delete = activity.id
    await request.cache().set(cache)
    return h.view(this.path, { river,
      details: {
        licenceNumber: cache.licenceNumber,
        postcode: cache.postcode,
        year: cache.year
      }
    })
  }

  /**
   * Post handler for the delete activity page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    await activitiesApi.deleteById(request, cache.delete)
    delete cache.delete
    await request.cache().set(cache)
    return h.redirect('/summary')
  }
}
