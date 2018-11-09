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

  /*
   * Check methods - allow blanks in the input which will be translated to zero's for display purposes
   * but don't create entries in the counts array where the number is not set
   * because the API will not accept them. Otherwise we assign to counts and allow the API to perform validation
   */
  const methods = await methodsApi.list(request)
  const counts = []
  methods.forEach(m => {
    const name = m.name.toLowerCase()
    if (Object.keys(payload).includes(name)) {
      const count = payload[name]
      if (count && count.trim()) {
        const num = checkNumber(name, count, errors)
        if (Number.parseInt(num) !== 0) {
          counts.push({
            method: m.id,
            count: num
          })
        }
      }
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

    let result
    if (cache.smallCatch) {
      result = await smallCatchesApi.change(request,
        cache.smallCatch.id,
        activities.find(a => a.river.id === payload.river).id,
        payload.month,
        counts,
        payload.released
      )
    } else {
      result = await smallCatchesApi.add(request,
        cache.submissionId,
        activities.find(a => a.river.id === payload.river).id,
        payload.month,
        counts,
        payload.released
      )
    }

    if (Object.keys(result).includes('errors')) {
      return apiErrors(result).map(e => {
        /*
         * With small catch errors may come with in the property and they need to be stitched
         * back to the catch-method that caused them.
         */
        if (e.property) {
          const pos = Number.parseInt(/counts\[(.*)\]/.exec(e.property)[1])
          const method = methods.find(m => m.id === counts[pos].method)
          e[method.name] = e.SmallCatch
          delete e.property
          delete e.SmallCatch
        }

        return e
      })
    } else {
      return null
    }
  } else {
    return errors
  }
}
