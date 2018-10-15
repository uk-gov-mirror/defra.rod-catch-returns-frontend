'use strict'

/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')
const getContactFromLicenceKey = require('../api/licence').getContactFromLicenceKey

module.exports = async (request) => {
  const payload = request.payload
  logger.debug('Validate licence: ' + JSON.stringify(payload))

  // Set up the contact id for the licence in the cache
  const contact = await getContactFromLicenceKey(request, request.payload.licence.toUpperCase().trim())

  if (!payload) {
    return { year: 'EMPTY' }
  }
}
