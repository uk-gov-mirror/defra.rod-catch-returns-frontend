'use strict'

/**
 * Confirm page for age weight key uploads
 */
const BaseHandler = require('./base')

module.exports = class AgeWeightKeyCancelHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Confirm page for age weight key uploads
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    await this.clearCacheErrorsAndPayload(request)
    return h.redirect('/licence')
  }
}
