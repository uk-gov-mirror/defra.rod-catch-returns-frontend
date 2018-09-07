'use strict'

/**
 * Salmon and large trout handler
 */
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
    if (request.params.id === 'add') {
      // Add a new salmon and large trout
      const cache = await request.cache().get()
      let submission = await submissionsApi.getById(cache.submissionId)
      const activities = await activitiesApi.getFromLink(submission._links.activities.href)
      const rivers = activities.map(a => a.river)

      return this.readCacheAndDisplayView(request, h, {
        rivers,
        year: cache.year,
        types: await speciesApi.list(),
        methods: await methodsApi.list()
      })
    } else {
      // Edit the salmon and large trout - replace with a database get
      const payload = {
        river: '0',
        'date-day': 6,
        'date-month': 6,
        type: 'Salmon',
        pounds: 6,
        ounces: 6,
        system: 'metric',
        kilograms: 6,
        method: 'Fly',
        released: 'true'
      }
      // Some hardcoded example data
      // return h.view(this.path, { rivers, year, types, methods, payload })
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
      `/salmon-and-large-trout/${encodeURIComponent(request.params.id)}`)
  }
}
