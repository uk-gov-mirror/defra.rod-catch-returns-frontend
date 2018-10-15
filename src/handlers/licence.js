'use strict'

/**
 * The non-authenticating licence handler (FMT)
 */
const LicenceAuthHandler = require('./licence-login')

module.exports = class LicenceHandler extends LicenceAuthHandler {
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
    // Set up the contact id for the licence in the cache
    const contact = await getContactFromLicenceKey(request, request.payload.licence.toUpperCase().trim())

    const cache = await request.cache().get()
    cache.contactId = contact.contact.id
    await request.cache().set(cache)

    return h.redirect('/select-year')
  }
}
