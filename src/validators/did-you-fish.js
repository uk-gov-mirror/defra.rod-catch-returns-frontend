'use strict'

/**
 * Validate the did you fish input
 */
const { logger } = require('defra-logging-facade')

module.exports = async (request) => {
  const payload = request.payload

  let errors = []

  if (!payload.dyf) {
    errors.push({ dyf: 'EMPTY' })
  }

  return errors.length ? errors : null
}
