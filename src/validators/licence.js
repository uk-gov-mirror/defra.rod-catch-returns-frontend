/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.debug('Validate licence: ' + JSON.stringify(payload))

  let errors = []

  if (payload.licence === 'error') {
    throw new Error(payload.postcode)
  }

  // Test the licence number
  if (!payload.licence) {
    errors.push({ licence: 'EMPTY' })
  } else if (String(payload.licence).toUpperCase() !== 'B7A718') {
    errors.push({ licence: 'NOT_FOUND' })
  }

  // Test the postcode
  if (!payload.postcode) {
    errors.push({ licence: 'EMPTY' })
  } else if (String(payload.postcode).toUpperCase().replace(' ', '') !== 'WA41HT') {
    errors.push({ licence: 'NOT_FOUND' })
  }

  return errors.length ? errors : null
}
