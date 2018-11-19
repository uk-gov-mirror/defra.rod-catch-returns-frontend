'use strict'

/**
 * Validate the small catch
 */
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const SmallCatchesApi = require('../api/small-catches')
const MethodsApi = require('../api/methods')
const checkNumber = require('./common').checkNumber
const apiErrors = require('./common').apiErrors

const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()
const smallCatchesApi = new SmallCatchesApi()
const methodsApi = new MethodsApi()

module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  const cache = await request.cache().get()

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
      const res = apiErrors(result)
      const invalids = res.filter(r => r.invalidValue)[0]

      if (invalids) {
        const ret = invalids.invalidValue.map(v => {
          v[v.method.name] = invalids.SmallCatch
          delete v.method
          delete v.count
          return v
        })
        return res.filter(r => !r.invalidValue).concat(ret).sort((a, b) => {
          const ord = { Fly: 1, Spinner: 2, Bait: 3, Unknown: 4, SmallCatch: 5 }
          const ao = ord[Object.keys(a)[0]]
          const bo = ord[Object.keys(b)[0]]
          return (ao - bo) / Math.abs(ao - bo)
        })
      } else {
        return res
      }
    } else {
      return null
    }
  } else {
    return errors
  }
}
