const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.info('Validate: ' + JSON.stringify(payload))

  if (payload.licence === 'error') {
    throw new Error(payload.postcode)
  }
}
