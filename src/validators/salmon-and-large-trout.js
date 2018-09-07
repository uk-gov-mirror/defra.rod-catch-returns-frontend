'use strict'

/**
 * Validate the salmon and large trout
 */
const moment = require('moment')
const apiErrors = require('./api-errors')
const CatchesApi = require('../api/catches')
const { logger } = require('defra-logging-facade')

const catchesApi = new CatchesApi()

module.exports = async (request, h) => {
  const payload = request.payload
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

  if (payload.system === 'metric') {
    const oz = 35.274 * Number.parseFloat(payload.kilograms)
    payload.pounds = Math.floor(oz / 16)
    payload.ounces = Math.round(oz % 16)
  } else {
    const oz = (16 * Number.parseInt(payload.pounds)) + Number.parseInt(payload.ounces)
    payload.kilograms = Math.round(0.0283495 * oz * 10) / 10
  }

  if (!errors.length) {
    const cache = await request.cache().get()
    try {
      const dateCaught = moment({ year: cache.year, month: payload['date-month'], day: payload['date-day'] })

      const mass = {
        kg: Number.parseFloat(payload.kilograms),
        oz: (16 * Number.parseInt(payload.pounds)) + Number.parseInt(payload.ounces),
        type: payload.system === 'metric' ? 'Metric' : 'Imperial'
      }

      await catchesApi.add(cache.submissionId,
        payload.river,
        dateCaught.format(),
        payload.type,
        mass,
        payload.method,
        payload.released === 'true'
      )

      return null
    } catch (err) {
      return apiErrors(err, errors)
    }
  } else {
    return errors
  }
}
