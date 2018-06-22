const logger = require('node-js-logger')

module.exports = async (payload) => {
  logger.info('Validate: ' + JSON.stringify(payload))
}
