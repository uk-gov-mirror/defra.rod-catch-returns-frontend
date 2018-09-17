'use strict'

/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

const allowed = [
  { licence: 'B7A718', postcode: 'WA41HT' },
  { licence: 'B7A728', postcode: 'WA42HT' },
  { licence: 'B7A738', postcode: 'WA43HT' },
  { licence: 'B7A748', postcode: 'WA44HT' },
  { licence: 'B7A758', postcode: 'WA45HT' },
  { licence: 'B7A768', postcode: 'WA46HT' },
  { licence: 'B7A778', postcode: 'WA47HT' },
  { licence: 'B7A788', postcode: 'WA48HT' }
]

module.exports = async (request) => {
  const payload = request.payload
  logger.debug('Validate licence: ' + JSON.stringify(payload))

  let errors = []

  if (payload.licence === 'error') {
    throw new Error(payload.postcode)
  }

  // Test the licence number
  if (!payload.licence) {
    errors.push({ licence: 'EMPTY' })
  } else if (!payload.postcode) {
    errors.push({ licence: 'EMPTY' })
  } else {
    const lic = String(payload.licence).trim().toUpperCase().replace(' ', '')
    const pc = String(payload.postcode).trim().toUpperCase().replace(' ', '')

    if (!allowed.find(a => a.licence === lic && a.postcode === pc)) {
      errors.push({ licence: 'NOT_FOUND' })
    }
  }

  return errors.length ? errors : null
}
