'use strict'

/**
 * Small catch handler
 */
const Moment = require('moment')

const BaseHandler = require('./base')
const MethodsApi = require('../api/methods')
const SubmissionsApi = require('../api/submissions')
const SmallCatchesApi = require('../api/catches')
const ActivitiesApi = require('../api/activities')

const submissionsApi = new SubmissionsApi()
const smallCatchesApi = new SmallCatchesApi()
const activitiesApi = new ActivitiesApi()
const methodsApi = new MethodsApi()

module.exports = class SalmonAndLargeTroutHandler extends BaseHandler {
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
    const submission = await submissionsApi.getById(cache.submissionId)
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)
    const rivers = activities.map(a => a.river)

    // Calculate calendar months
    const months = [ ...Array(12).keys() ].map(m => {
      const mth = Moment({ month: m }).format('MMMM')
      return {
        value: mth.toUpperCase(),
        text: mth
      }
    })

    if (request.params.id === 'add') {
      // Clear any existing catch id
      delete cache.smallCatch
      await request.cache().set(cache)

      // Add a new salmon and large trout
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        year: cache.year,
        months: months,
        methods: await methodsApi.list()
      })
    } else {
      // Modify an existing catch
      const smallCatch = await smallCatchesApi.getById(`smallCatches/${request.params.id}`)

      // Write the catch id onto the cache
      cache.smallCatch = { id: smallCatch.id }
      await request.cache().set(cache)

      // Check they are not messing about with somebody else's submission
      if (cache.submissionId !== submission.id) {
        throw new Error('Action attempted on not owned submission')
      }

      // Prepare a the payload
      const ctch = await smallCatchesApi.doMap(smallCatch)

      const payload = {
        river: ctch.river.id,
        released: ctch.released ? 'true' : 'false'
      }

      return h.view(this.path, {
        rivers: rivers,
        year: cache.year,
        methods: await methodsApi.list(),
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
    return this.writeCacheAndRedirect(request, h, errors, '/summary',
      `/small-catches/${encodeURIComponent(request.params.id)}`)
  }
}
