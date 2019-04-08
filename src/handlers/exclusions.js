'use strict'
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const SmallCatchesApi = require('../api/small-catches')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const smallCatchesApi = new SmallCatchesApi()

/**
 * Write the state of the exclusions flags into the cache
 */
const BaseHandler = require('./base')

module.exports = class ExclusionsHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Post handler for exclusion flags
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    const submission = await submissionsApi.getById(request, cache.submissionId)
    const catches = await catchesApi.getFromLink(request, submission._links.catches.href)
    const smallCatches = await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)

    const payloadKey = Object.keys(request.payload)[0]

    if (payloadKey === 'exclude-1') {
      const setting = request.payload[payloadKey]

      // Change the submission level exclusion if necessary
      if (submission.reportingExclude !== setting) {
        await submissionsApi.changeExclusion(request, submission.id, setting)
      }

      // Cascade the small catch exclusions if necessary
      await Promise.all(smallCatches.map(async c => {
        if (c.reportingExclude !== setting) {
          await smallCatchesApi.changeExclusion(request, c.id, setting)
        }
      }))

      // Cascade the large catch exclusions if necessary
      await Promise.all(catches.map(async c => {
        if (c.reportingExclude !== setting) {
          await catchesApi.changeExclusion(request, c.id, setting)
        }
      }))
    } else if (payloadKey.includes('smallCatches')) {
      const key = payloadKey.replace('exclude-', '')
      const setting = request.payload[payloadKey]
      const smallCatch = smallCatches.find(c => c.id === key)
      if (smallCatch && smallCatch.reportingExclude !== setting) {
        await smallCatchesApi.changeExclusion(request, key, setting)
      }
    } else if (payloadKey.includes('catches')) {
      const key = payloadKey.replace('exclude-', '')
      const setting = request.payload[payloadKey]
      const largeCatch = catches.find(c => c.id === key)
      if (largeCatch && largeCatch.reportingExclude !== setting) {
        await catchesApi.changeExclusion(request, key, setting)
      }
    }

    return null
  }
}
