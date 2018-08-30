/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.debug('Validate licence: ' + JSON.stringify(payload))
}
