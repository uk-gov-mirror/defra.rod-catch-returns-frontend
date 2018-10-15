'use strict'

/**
 * Validate the small catch
 */
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const SmallCatchesApi = require('../api/small-catches')
const MethodsApi = require('../api/methods')
const checkNumber = require('./common').checkNumber
const { logger } = require('defra-logging-facade')
const apiErrors = require('./common').apiErrors

const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()
const smallCatchesApi = new SmallCatchesApi()
const methodsApi = new MethodsApi()

module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  const cache = await request.cache().get()

  logger.debug('Validate the small catches: ' + JSON.stringify(payload))

  // Validate that the river has been selected
  if (!payload.river) {
    errors.push({ river: 'EMPTY' })
  }

  if (!payload.month) {
    errors.push({ months: 'EMPTY' })
  }

  // Check methods - allow blanks here
  const methods = await methodsApi.list(request)
  methods.forEach(m => {
    if (payload[m.name.toLowerCase()].trim()) {
      checkNumber(m.name.toLowerCase(), payload[m.name.toLowerCase()], errors)
    }
  })

  // Check released
  if (payload.released.trim()) {
    checkNumber('released', payload.released, errors)
  } else {
    payload.released = 0
  }

  if (!errors.length) {
    const submission = await submissionsApi.getById(request, cache.submissionId)
    const activities = await activitiesApi.getFromLink(request, submission._links.activities.href)
    try {
      if (cache.smallCatch) {
        await smallCatchesApi.change(request, cache.smallCatch.id,
          cache.submissionId,
          activities.find(a => a.river.id === payload.river).id,
          payload.month,
          payload.fly,
          payload.spinner,
          payload.bait,
          payload.released
        )
      } else {
        await smallCatchesApi.add(request, cache.submissionId,
          activities.find(a => a.river.id === payload.river).id,
          payload.month,
          payload.fly,
          payload.spinner,
          payload.bait,
          payload.released
        )
      }
      return null
    } catch (err) {
      return apiErrors(err, errors)
    }
  } else {
    return errors
  }
}
