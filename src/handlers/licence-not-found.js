'use strict'

/**
 * Handler for invalid licence entry. This is used because until the licence is validated there
 * is no session cache so a separate handler is needed to handle the errors
 */
const BaseHandler = require('./base')
const authentication = require('./authentication')

module.exports = class LicenceHandler extends BaseHandler {
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
    return h.view(this.path, { errors: { licence: 'NOT_FOUND' } })
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
      return h.redirect('/licence-not-found')
    }

    return authentication(request, h, request.payload.licence)
  }
}
