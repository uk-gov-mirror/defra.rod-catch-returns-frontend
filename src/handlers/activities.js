'use strict'

const BaseHandler = require('./base')
const RiversApi = require('../api/rivers')
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')

const submissionsApi = new SubmissionsApi()
const riversApi = new RiversApi()
const activitiesApi = new ActivitiesApi()

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
    // Filter out the rivers already selected
    const cache = await request.cache().get()
    let submission = await submissionsApi.getById(cache.submissionId)
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)
    const rivers = (await riversApi.list())
      .filter(r => !activities.map(a => a.river.id).includes(r.id))

    return this.readCacheAndDisplayView(request, h, { rivers })
  }

  /**
   * post handler for the add activity page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return this.writeCacheAndRedirect(request, h, errors, '/summary', this.path)
  }
}
