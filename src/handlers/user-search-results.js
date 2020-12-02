'use strict'

/**
 * Ask the FMT user for their authorization details
 */
const BaseHandler = require('./base')

module.exports = class UserSearchResultsHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Display the user search page page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path)
  }

}
