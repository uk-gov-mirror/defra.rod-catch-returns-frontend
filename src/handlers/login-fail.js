'use strict'

/**
 * Handler for invalid FMT user authorization.
 */
const LoginHandler = require('./login')

module.exports = class FailedLoginHandler extends LoginHandler {
  /**
   * Display the licence/postcode authentication page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path, { errors: { user: 'NOT_FOUND' } })
  }
}
