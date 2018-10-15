'use strict'

/**
 * Small catch handler
 */
const Moment = require('moment')

const BaseHandler = require('./base')
const MethodsApi = require('../api/methods')
const SubmissionsApi = require('../api/submissions')
const SmallCatchesApi = require('../api/small-catches')
const ActivitiesApi = require('../api/activities')
const testLocked = require('./common').testLocked

const submissionsApi = new SubmissionsApi()
const smallCatchesApi = new SmallCatchesApi()
const activitiesApi = new ActivitiesApi()
const methodsApi = new MethodsApi()

// Calculate calendar months
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    value: mth.toUpperCase(),
    text: mth
  }
})

module.exports = class SmallCatchHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for select salmon and large trout page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()
    const submission = await submissionsApi.getById(request, cache.submissionId)
    const activities = await activitiesApi.getFromLink(request, submission._links.activities.href)
    const rivers = activities.map(a => a.river)

    // Test if the submission is locked and if so redirect to the review screen
    if (await testLocked(request, cache, submission)) {
      return h.redirect('/review')
    }

    if (request.params.id === 'add') {
      // Clear any existing catch id
      delete cache.smallCatch
      await request.cache().set(cache)

      // Add a new salmon and large trout
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        months: months,
        methods: await methodsApi.list(request),
        add: true
      })
    } else {
      // Modify an existing catch
      let smallCatch = await smallCatchesApi.getById(request, `smallCatches/${request.params.id}`)
      const smallCatchSubmission = await submissionsApi.getFromLink(request, smallCatch._links.submission.href)
      smallCatch = await smallCatchesApi.doMap(request, smallCatch)

      // Check they are not messing about with somebody else's activity
      if (smallCatchSubmission.id !== submission.id) {
        throw new Error('Action attempted on not owned submission')
      }

      // Write the catch id onto the cache
      cache.smallCatch = { id: smallCatch.id }
      await request.cache().set(cache)

      const payload = {
        river: smallCatch.activity.river.id,
        released: smallCatch.released,
        month: smallCatch.month
      }

      const flyCount = smallCatch.counts.find(c => c.method.name.toLowerCase() === 'fly')
      payload.fly = flyCount ? flyCount.count : null

      const baitCount = smallCatch.counts.find(c => c.method.name.toLowerCase() === 'bait')
      payload.bait = baitCount ? baitCount.count : null

      const spinnerCount = smallCatch.counts.find(c => c.method.name.toLowerCase() === 'spinner')
      payload.spinner = spinnerCount ? spinnerCount.count : null

      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        months: months,
        methods: await methodsApi.list(request),
        payload: payload
      })
    }
  }

  /**
   * Post handler for the small catch
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return SmallCatchHandler.writeCacheAndRedirect(request, h, errors, '/summary',
      `/small-catches/${encodeURIComponent(request.params.id)}`)
  }
}
