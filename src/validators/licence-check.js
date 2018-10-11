'use strict'

const { logger } = require('defra-logging-facade')
const getContactFromLicenceKey = require('../api/licence').getContactFromLicenceKey

/**
 * Get the contact details from the API/CRM via the provided licence key
 * @param request
 * @returns {Promise<*>}
 */
module.exports = async (payload) => {
  // logger.debug('Getting contact for: ' + JSON.stringify(payload.licence))
  // payload.contact = await getContactFromLicenceKey(payload.licence.toUpperCase().trim())
}
