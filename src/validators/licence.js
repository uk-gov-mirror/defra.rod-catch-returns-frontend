'use strict'

/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (request) => {
  const errors = []
  const payload = request.payload
  logger.debug('Validate licence: ' + JSON.stringify(payload))

  // Unmatched licence number
  if (!payload.licence) {
    errors.push({ licence: 'EMPTY' })
  } else if (!payload.postcode) {
    errors.push({ postcode: 'EMPTY' })
  } else if (!payload.contact) {
    errors.push({ licence: 'NOT_FOUND' })
  } else if (payload.postcode.toUpperCase().replace(/\s/g, '') !==
      payload.contact.contact.postcode.toUpperCase().replace(/\s/g, '')) {
    errors.push({ postcode: 'NOT_FOUND' })
  } else {
    return null
  }

  return errors
}
