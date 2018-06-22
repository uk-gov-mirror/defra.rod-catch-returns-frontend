const logger = require('../lib/logging').logger

module.exports = async (payload) => {
  logger.info('Validate: ' + JSON.stringify(payload))
}
