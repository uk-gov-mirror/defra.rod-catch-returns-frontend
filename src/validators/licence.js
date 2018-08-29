/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.debug('Validate: ' + JSON.stringify(payload))
}
