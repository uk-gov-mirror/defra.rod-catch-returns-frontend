'use strict'

/**
 * Validate the user login
 */
const { logger } = require('defra-logging-facade')

module.exports = async (request) => {
  logger.debug('Validate login: ' + JSON.stringify(request.payload))
  if (request.app.authorization) {
    return null
  } else {
    return [ { authorization: 'NO_FOUND' } ]
  }
}
