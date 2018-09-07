'use strict'

/**
 * Summary handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const ActivitiesApi = require('../api/activities')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const activitiesApi = new ActivitiesApi()

const salmonAndLargeTrout = [
  {
    id: 0,
    river: 'Derwent (Cumbria)',
    date: '08/18',
    type: 'Salmon',
    weight: '10lb 2oz',
    released: true,
    method: 'Fly'
  },
  {
    id: 1,
    river: 'Trent',
    date: '03/18',
    type: 'Salmon',
    weight: '10lb 8oz',
    released: false,
    method: 'Spinner'
  }
]

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

    let submission = await submissionsApi.getByContactIdAndYear(cache.contactId, cache.year)

    if (!submission) {
      submission = await submissionsApi.add(cache.contactId, cache.year)
    }
    cache.submissionId = submission.id
    await request.cache().set(cache)

    const activities = await activitiesApi.getFromLink(submission._links.activities.href)
    // const catches = await catchesApi.getFromLink(submission._links.catches.href)

    /*
     *const submission = await submissionsApi.add(cache.contactId, cache.year)
     * const activitiesApi = await submissionsApi.getFromLink(submission._links.activities.href)
     * const catches = await catchesApi.getFromLink(submission._links.catches.href)
     */
    return h.view(this.path, { salmonAndLargeTrout, year: cache.year, activities })
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
