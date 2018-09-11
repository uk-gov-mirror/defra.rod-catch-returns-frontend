'use strict'

/**
 * Salmon and large trout handler
 */
const Moment = require('moment')

const BaseHandler = require('./base')
const MethodsApi = require('../api/methods')
const SpeciesApi = require('../api/species')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const ActivitiesApi = require('../api/activities')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const activitiesApi = new ActivitiesApi()
const methodsApi = new MethodsApi()
const speciesApi = new SpeciesApi()

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

    if (request.params.id === 'add') {
      // Clear any existing catch id
      delete cache.largeCatch
      await request.cache().set(cache)

      // Add a new salmon and large trout
      return this.readCacheAndDisplayView(request, h, {
        rivers: rivers,
        year: cache.year,
        types: await speciesApi.list(),
        methods: await methodsApi.list()
      })
    } else {
      // Modify an existing catch
      const largeCatch = await catchesApi.getById(`catches/${request.params.id}`)

      // Write the catch id onto the cache
      cache.largeCatch = { id: largeCatch.id }
      await request.cache().set(cache)

      // Check they are not messing about with somebody else's submission
      if (cache.submissionId !== submission.id) {
        throw new Error('Action attempted on not owned submission')
      }

      // Prepare a the payload
      const ctch = await catchesApi.doMap(largeCatch)
      const dateCaught = Moment(ctch.dateCaught)

      const payload = {
        river: ctch.river.id,
        'date-day': dateCaught.format('DD'),
        'date-month': dateCaught.format('MM'),
        type: ctch.species.id,
        pounds: Math.floor(ctch.mass.oz / 16),
        ounces: Math.round(ctch.mass.oz % 16),
        system: ctch.mass.type,
        kilograms: ctch.mass.kg,
        method: ctch.method.id,
        released: ctch.released ? 'true' : 'false'
      }

      return this.readCacheAndDisplayView(request, h,  {
        rivers: rivers,
        year: cache.year,
        types: await speciesApi.list(),
        methods: await methodsApi.list(),
        payload: payload
      })
    }
  }

  /**
   * Post handler for the select salmon and large trout page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return this.writeCacheAndRedirect(request, h, errors, '/summary',
      `/catches/${encodeURIComponent(request.params.id)}`)
  }
}
