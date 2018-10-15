'use strict'

/**
 * The non-authenticating licence handler (FMT)
 */
const BaseHandler = require('./base')

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
    return this.readCacheAndDisplayView(request, h, {})
  }
  /**
   * If the licence and postcode have been validated save the contact id
   * redirect to the start of the authenticated journey
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    let cache = await request.cache().get()
    if (!errors) {
      cache.contactId = request.payload.contact.contact.id
      if (cache.errors || cache.payload) {
        delete cache.errors
        delete cache.payload
      }
      await request.cache().set(cache)
      return h.redirect('/select-year')
    } else {
      cache.errors = errors
      cache.payload = request.payload
      await request.cache().set(cache)
      return h.redirect('/licence')
    }
  }
}
