'use strict'

/**
 * Delete Salmon and large trout Handler
 */
const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const Moment = require('moment')

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()

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
    const largeCatch = await catchesApi.getById(`catches/${request.params.id}`)
    const submission = await submissionsApi.getFromLink(largeCatch._links.submission.href)

    // Check they are not messing about with somebody else's submission
    if (cache.submissionId !== submission.id) {
      throw new Error('Action attempted on not owned submission')
    }

    const c = await catchesApi.doMap(largeCatch)
    c.dateCaught = Moment(c.dateCaught).format('DD/MM')

    if (c.mass.type === 'IMPERIAL') {
      c.weight = Math.floor(c.mass.oz / 16).toString() + 'lbs ' + Math.round(c.mass.oz % 16).toString() + 'oz'
    } else {
      c.weight = (Math.round(c.mass.kg * 10) / 10).toString() + 'Kg'
    }

    // Save the id to delete
    cache.delete = largeCatch.id
    await request.cache().set(cache)
    return h.view(this.path, { largeCatch: c })
  }

  /**
   * Post handler for the delete large catch page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    await catchesApi.deleteById(cache.delete)
    delete cache.delete
    await request.cache().set(cache)
    return h.redirect('/summary')
  }
}
