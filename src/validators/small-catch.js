'use strict'

/**
 * Validate the small catch
 */
const apiErrors = require('./common').apiErrors
const MethodsApi = require('../api/methods')
const checkNumber = require('./common').checkNumber
const SmallCatchesApi = require('../api/small-catches')
const { logger } = require('defra-logging-facade')

const smallCatchesApi = new SmallCatchesApi()
const mathodsApi = new MethodsApi()

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

  // Check methods
  const methods = await mathodsApi.list()
  methods.forEach(m => checkNumber(m.name.toLowerCase(), payload[m.name.toLowerCase()], errors))

  // Check released
  checkNumber('released', payload.released, errors)

  if (!errors.length) {
    try {
      if (cache.smallCatch) {
        await smallCatchesApi.change(cache.smallCatch.id,
          cache.submissionId,
          payload.river,
          payload.month,
          payload.fly,
          payload.spinner,
          payload.bait,
          payload.released
        )
      } else {
        await smallCatchesApi.add(cache.submissionId,
          payload.river,
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
