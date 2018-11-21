'use strict'

/**
 * Ask the user for their fish licence number and postcode
 */
const BaseHandler = require('./base')
const authenticateUser = require('../lib/authenticate-user')

module.exports = class LicenceAuthHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Display the licence/postcode authentication page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path)
  }

  /**
   * If the licence and postcode have been authenticated using the
   * validator then assign a session identifier to the authorization cookie
   * and redirect to the start of the authenticated journey
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    if (errors) {
      return h.redirect('/licence-auth-fail')
    }

    // No errors so we can authenticate this user
    await authenticateUser(request)
    return h.redirect('/select-year')
  }
}
