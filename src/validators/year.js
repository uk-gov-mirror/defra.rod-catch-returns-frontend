/**
 * Validate the licence number and postcode
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.info('Validate: ' + JSON.stringify(payload))

  if (!payload.selectYear) {
    return { selectYear: 'EMPTY' }
  }
}
