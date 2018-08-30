/**
 * Validate the salmon and large trout
 */
const { logger } = require('defra-logging-facade')

module.exports = async (payload) => {
  logger.debug('Validate salmon and large trout: ' + JSON.stringify(payload))

  const errors = []

  if (!payload.river) {
    errors.push({ river: 'EMPTY' })
  }

  if (Number.isNaN(Number.parseInt(payload['date-month'])) || Number.isNaN(Number.parseInt(payload['date-day']))) {
    errors.push({ date: 'INVALID' })
  }

  if (!payload.type) {
    errors.push({ type: 'EMPTY' })
  }

  if (!payload.system) {
    errors.push({ system: 'EMPTY' })
  } else if (payload.system === 'imperial') {
    if (Number.isNaN(Number.parseInt(payload.pounds))) {
      errors.push({ pounds: 'INVALID' })
    }
    if (Number.isNaN(Number.parseInt(payload.ounces))) {
      errors.push({ ounces: 'INVALID' })
    }
  } else if (payload.system === 'metric') {
    if (Number.isNaN(Number.parseInt(payload.kilograms))) {
      errors.push({ kilograms: 'INVALID' })
    }
  }

  if (!payload.method) {
    errors.push({ method: 'EMPTY' })
  }

  if (!payload.released) {
    errors.push({ released: 'EMPTY' })
  }

  return errors.length ? errors : null
}
