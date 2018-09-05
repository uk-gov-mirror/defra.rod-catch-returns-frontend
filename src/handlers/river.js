'use strict'

const BaseHandler = require('./base')
const RiversApi = require('../api/rivers')
const riversApi = new RiversApi()

module.exports = class RiverHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for add river page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const rivers = await riversApi.list()
    return this.readCacheAndDisplayView(request, h, { rivers })
  }

  /**
   * post handler for the add river page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return this.writeCacheAndRedirect(request, h, errors, '/summary', '/river')
  }
}
