/**
 * Validate the river and the number of days fished
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.debug('Validate river: ' + JSON.stringify(payload))

  let errors = []

  if (Number.isNaN(Number.parseInt(payload.river))) {
    errors.push({ river: 'NOT_SELECTED' })
  }

  if (Number.isNaN(Number.parseInt(payload.days))) {
    errors.push({ days: 'EMPTY' })
  }

  return errors.length ? errors : null
}
