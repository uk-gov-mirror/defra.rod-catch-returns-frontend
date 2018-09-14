'use strict'

/**
 * Validate the salmon and large trout
 */
const moment = require('moment')
const apiErrors = require('./common').apiErrors
const checkNumber = require('./common').checkNumber
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const CatchesApi = require('../api/catches')

const { logger } = require('defra-logging-facade')

const catchesApi = new CatchesApi()
const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()

module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  const cache = await request.cache().get()
  let dateCaught

  logger.debug('Validate salmon and large trout: ' + JSON.stringify(payload))

  // Validate that the river has been selected
  if (!payload.river) {
    errors.push({ river: 'EMPTY' })
  }

  // Validate the date
  if (!payload['date-month'] || !payload['date-day']) {
    errors.push({ date: 'EMPTY' })
  } else if (Number.isNaN(Number.parseInt(payload['date-month'])) || Number.isNaN(Number.parseInt(payload['date-day']))) {
    errors.push({ date: 'INVALID' })
    payload['date-day'] = payload['date-month'] = null
  } else {
    dateCaught = moment({ year: cache.year, month: payload['date-month'] - 1, day: payload['date-day'] })
    if (!dateCaught.isValid()) {
      errors.push({ date: 'INVALID' })
      payload['date-day'] = payload['date-month'] = null
    }
  }

  if (!payload.type) {
    errors.push({ type: 'EMPTY' })
  }

  if (!payload.system) {
    errors.push({ system: 'EMPTY' })
  } else if (payload.system === 'IMPERIAL') {
    checkNumber('pounds', payload.pounds, errors)
    checkNumber('ounces', payload.ounces, errors, 16)
  } else if (payload.system === 'METRIC') {
    checkNumber('kilograms', payload.kilograms, errors)
  }

  if (!payload.method) {
    errors.push({ method: 'EMPTY' })
  }

  if (!payload.released) {
    errors.push({ released: 'EMPTY' })
  }

  // Do the conversion
  if (payload.system === 'METRIC' && errors.filter(e => e['kilograms']).length === 0) {
    const oz = 35.274 * Number.parseFloat(payload.kilograms)
    payload.pounds = Math.floor(oz / 16)
    payload.ounces = Math.round(oz % 16)
  } else if (payload.system === 'IMPERIAL' && errors.filter(e => e['pounds']).length === 0 && errors.filter(e => e['ounces']).length === 0) {
    const oz = (16 * Number.parseInt(payload.pounds)) + Number.parseInt(payload.ounces)
    payload.kilograms = Math.round(0.0283495 * oz * 10) / 10
  }

  if (!errors.length) {
    const submission = await submissionsApi.getById(cache.submissionId)
    const activities = await activitiesApi.getFromLink(submission._links.activities.href)
    try {
      const dateCaught = moment({ year: cache.year, month: payload['date-month'] - 1, day: payload['date-day'] })

      const mass = {
        kg: Number.parseFloat(payload.kilograms),
        oz: (16 * Number.parseInt(payload.pounds)) + Number.parseInt(payload.ounces),
        type: payload.system
      }

      // Test if we are adding or updating
      if (cache.largeCatch) {
        await catchesApi.change(cache.largeCatch.id,
          cache.submissionId,
          activities.find(a => a.river.id === payload.river).id,
          dateCaught.format(),
          payload.type,
          mass,
          payload.method,
          payload.released === 'true'
        )
      } else {
        await catchesApi.add(cache.submissionId,
          activities.find(a => a.river.id === payload.river).id,
          dateCaught.format(),
          payload.type,
          mass,
          payload.method,
          payload.released === 'true'
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
