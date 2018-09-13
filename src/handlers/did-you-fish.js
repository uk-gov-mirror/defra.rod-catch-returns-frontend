'use strict'

/**
 * Delete Activity Handler
 */
const BaseHandler = require('./base')

module.exports = class DidYouFishHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for delete activity page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return this.readCacheAndDisplayView(request, h, {
      year: 2018
    })
  }

  /**
   * Post handler for the delete activity page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return this.writeCacheAndRedirect(request, h, errors, '/summary', this.path)
  }
}
