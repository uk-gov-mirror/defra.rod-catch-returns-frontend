'use strict'

/**
 * Display the confirmation page
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const submissionsApi = new SubmissionsApi()

module.exports = class ConfirmHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for main page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()
    const submission = await submissionsApi.getById(cache.submissionId)

    // If the submission status is not submitted, throw an error
    if (submission.status !== 'SUBMITTED') {
      throw new Error('Illegal access of the confirmation page')
    }

    await request.cache().drop()
    request.cookieAuth.clear()
    return h.view(this.path)
  }
}
