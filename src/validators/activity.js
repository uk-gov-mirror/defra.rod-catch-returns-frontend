'use strict'

/**
 * Validate the river and the number of days fished
 */
const { logger } = require('defra-logging-facade')
const apiErrors = require('./api-errors')
const ActivitiesApi = require('../api/activities')
const activitiesApi = new ActivitiesApi()

module.exports = async (request, h) => {
  const payload = request.payload
  logger.debug('Validate activity: ' + JSON.stringify(payload))

  let errors = []

  if (!payload.river) {
    errors.push({ River: 'NOT_SELECTED' })
  }

  if (!payload.days || !payload.days.trim()) {
    errors.push({ Activity: 'EMPTY' })
  } else if (Number.isNaN(Number.parseInt(payload.days))) {
    errors.push({ Activity: 'NOT_A_NUMBER' })
  }

  // if there are no errors try to persist the activity
  if (!errors.length) {
    const cache = await request.cache().get()
    try {
      await activitiesApi.add(cache.submissionId, payload.river, payload.days)
      return null
    } catch (err) {
      return apiErrors(err, errors)
    }
  } else {
    return errors
  }
}
