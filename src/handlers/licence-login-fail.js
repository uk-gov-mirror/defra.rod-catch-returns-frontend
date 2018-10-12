'use strict'

/**
 * Handler for invalid licence entry. This is used because until the licence is validated there
 * is no session cache so a separate handler is needed to handle the errors
 */
const LicenceHandler = require('./licence-login')

module.exports = class LicenceAuthNotFoundHandler extends LicenceHandler {
  /**
   * Display the licence/postcode authentication page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path, { errors: { licence: 'NOT_FOUND' } })
  }
}
