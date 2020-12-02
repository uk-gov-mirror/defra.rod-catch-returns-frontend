'use strict'

/**
 * Ask the FMT user for their authorization details
 */
const BaseHandler = require('./base')

module.exports = class UserSearchHandler extends BaseHandler {
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

  /**
   * If the user has been authenticated using the
   * validator then assign a session identifier to the authorization cookie
   * and redirect to the start of the authenticated journey
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {

    // In the FMT journey we can be redirected into the service
    return h.redirect(qryStr ? '/lookup' + qryStr : '/licence')
  }
}
