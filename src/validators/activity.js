'use strict'

/**
 * Validate the river and the number of days fished
 */
const { logger } = require('defra-logging-facade')
const apiErrors = require('./common').apiErrors
const checkNumber = require('./common').checkNumber

const ActivitiesApi = require('../api/activities')
const activitiesApi = new ActivitiesApi()

module.exports = async (request) => {
  const payload = request.payload
  logger.debug('Validate activity: ' + JSON.stringify(payload))

  let errors = []

  if (!payload.river) {
    errors.push({ River: 'NOT_SELECTED' })
  }

  checkNumber('Activity', payload.days, errors)

  // if there are no errors try to persist the activity
  if (!errors.length) {
    const cache = await request.cache().get()

    try {
      // Test if we are adding or updating
      if (cache.activity) {
        await activitiesApi.change(request, cache.activity.id, cache.submissionId, payload.river, payload.days)
        return null
      } else {
        await activitiesApi.add(request, cache.submissionId, payload.river, payload.days)
        return null
      }
    } catch (err) {
      return apiErrors(err, errors)
    }
  } else {
    return errors
  }
}
