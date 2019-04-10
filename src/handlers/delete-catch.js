'use strict'

/**
 * Delete small catch handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const SmallCatchesApi = require('../api/small-catches')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const smallCatchesApi = new SmallCatchesApi()

module.exports = class DeleteCatchHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  static async recalculateExclusion (request, cache) {
    // Clear the submission level exclude flag
    const submission = await submissionsApi.getById(request, cache.submissionId)
    const catches = await catchesApi.getFromLink(request, submission._links.catches.href)
    const smallCatches = await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)

    if (catches.every(c => c.reportingExclude) && smallCatches.every(c => c.reportingExclude) &&
      !submission.reportingExclude) {
      await submissionsApi.changeExclusion(request, submission.id, true)
    }
  }
}
