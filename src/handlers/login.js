'use strict'

/**
 * Ask the FMT user for their authorization details
 */
const BaseHandler = require('./base')
const authenticateUser = require('../lib/authenticate-user')

module.exports = class LoginHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Display the authentication page
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
    if (errors) {
      return h.redirect('/login-fail')
    }

    authenticateUser(request)
    return h.redirect('/licence')
  }
}
