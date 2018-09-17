'use strict'

/**
 * Delete Activity Handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const RiversApi = require('../api/rivers')
const testLocked = require('./common').testLocked

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
    const activityId = `activities/${request.params.id}`
    const activity = await activitiesApi.getById(activityId)

    if (!activity) {
      return h.redirect('/summary')
    }

    const river = await riversApi.getFromLink(activity._links.river.href)

    // Check they are not messing about with somebody else's submission
    const submission = await submissionsApi.getFromLink(activity._links.submission.href)
    const cache = await request.cache().get()

    if (cache.submissionId !== submission.id) {
      throw new Error('Action attempted on not owned submission')
    }

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    cache.delete = activity.id
    await request.cache().set(cache)
    return h.view(this.path, { river })
  }

  /**
   * Post handler for the delete activity page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    await activitiesApi.deleteById(cache.delete)
    delete cache.delete
    await request.cache().set(cache)
    return h.redirect('/summary')
  }
}
