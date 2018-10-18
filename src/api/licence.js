'use strict'

const Client = require('./client')
const Crypto = require('../lib/crypto')

/**
 * Licence handler - note licence is not an entity in the API model
 * is has a specific endpoint so it does not derive from EntityApi
 */
module.exports = {
  /**
   * Gets the contact data from the last 6 digits of the licence number
   * @param licence
   * @returns {Promise<*>}
   */
  getContactFromLicenceKey: async (request, licence) => {
    const cache = await request.cache().get()
    const auth = await Crypto.readObj(request.server.app.cache, cache.authorization)
    return Client.request(auth, Client.method.GET, `licence/${licence}`)
  }
}
