'use strict'

const BaseHandler = require('./base')
const RiversApi = require('../api/rivers')
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const testLocked = require('./common').testLocked

const submissionsApi = new SubmissionsApi()
const riversApi = new RiversApi()
const activitiesApi = new ActivitiesApi()

const { logger } = require('defra-logging-facade')

module.exports = class ActivitiesHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for add activity page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()

    logger.debug('Activities: Cache: ' + JSON.stringify(cache))

    let submission = await submissionsApi.getById(cache.submissionId)

    logger.debug('Activities: Submission: ' + JSON.stringify(submission))

    const activities = await activitiesApi.getFromLink(submission._links.activities.href)

    logger.debug('Activities: Activities: ' + JSON.stringify(submission))

    const rivers = await riversApi.list()

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    if (request.params.id === 'add') {
      delete cache.activity
      await request.cache().set(cache)

      // Filter out the rivers already selected
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers.filter(r => !activities.map(a => a.river.id).includes(r.id)),
        add: true
      })
    } else {
      let activity = await activitiesApi.getById(`activities/${request.params.id}`)
      const activitySubmission = await submissionsApi.getFromLink(activity._links.submission.href)
      activity = await activitiesApi.doMap(activity)

      // Check they are not messing about with somebody else's activity
      if (activitySubmission.id !== submission.id) {
        throw new Error('Action attempted on not owned submission')
      }

      // Write the catch id onto the cache
      cache.activity = { id: activity.id }
      await request.cache().set(cache)

      // Prepare a the payload
      const payload = {
        river: activity.river.id,
        days: activity.days
      }

      /*
       * Do not allow to switch to a river that is already in the submission other than the
       * one we are currently editing
       */
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers.filter(r => ![].concat(...activities.map(a => a.river))
          .filter(r => r.id !== activity.river.id).map(r2 => r2.id).includes(r.id)),
        payload: payload
      })
    }
  }

  /**
   * post handler for the add activity page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return this.writeCacheAndRedirect(request, h, errors, '/summary',
      `/activities/${encodeURIComponent(request.params.id)}`)
  }
}
