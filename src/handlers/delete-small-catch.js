'use strict'

/**
 * Delete small catch handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const SmallCatchesApi = require('../api/small-catches')
const testLocked = require('./common').testLocked

const Moment = require('moment')

const submissionsApi = new SubmissionsApi()
const smallCatchesApi = new SmallCatchesApi()

// Calculate calendar months
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    value: mth.toUpperCase(),
    text: mth
  }
})

module.exports = class DeleteRiverHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for delete large catch page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()
    const smallCatch = await smallCatchesApi.getById(`smallCatches/${request.params.id}`)

    // The back button on the browser can cause this
    if (!smallCatch) {
      return h.redirect('/summary')
    }

    const submission = await submissionsApi.getFromLink(smallCatch._links.submission.href)

    // Check they are not messing about with somebody else's submission
    if (cache.submissionId !== submission.id) {
      throw new Error('Action attempted on not owned submission')
    }

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    const c = await smallCatchesApi.doMap(smallCatch)
    c.month = months.find(m => m.value === c.month).text

    // Save the id to delete
    cache.delete = smallCatch.id
    await request.cache().set(cache)
    return h.view(this.path, { smallCatch: c })
  }

  /**
   * Post handler for the delete small catches
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    await smallCatchesApi.deleteById(cache.delete)
    delete cache.delete
    await request.cache().set(cache)
    return h.redirect('/summary')
  }
}
