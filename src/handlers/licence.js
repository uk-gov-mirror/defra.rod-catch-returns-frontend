/**
 * Ask the user for there fish licence number and postcode
 */
const uuid = require('uuid/v4')

const BaseHandler = require('./base')
const { logger } = require('defra-logging-facade')

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
      return h.redirect('/licence')
    }

    // Generate a new session identifier
    const sid = uuid()

    // Assign a new user
    const user = { contactId: 'CONTACTIDXX' }

    // Set the cookie to the session identifier
    request.cookieAuth.set({ sid: sid })

    // Set the server cache to the contact details
    await request.cache().set(user)

    logger.debug('Licence holder is authenticated: ' + JSON.stringify(user))

    return h.redirect('/select-year')
  }
}
