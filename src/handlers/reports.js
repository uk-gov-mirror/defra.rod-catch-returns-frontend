'use strict'

/**
 * Display the FMT users reports page
 */
const BaseHandler = require('./base')

module.exports = class ReportsHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for reports
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return this.readCacheAndDisplayView(request, h, { back: request.query.back })
  }
}
