'use strict'

const Client = require('./client')

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
  getContactFromLicenceKey: async (licence) => {
    return Client.request(Client.method.GET, `licence/${licence}`)
  }
}
