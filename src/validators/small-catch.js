'use strict'

/**
 * Validate the small catch
 */
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const SmallCatchesApi = require('../api/small-catches')
const MethodsApi = require('../api/methods')
const checkNumber = require('./common').checkNumber
const subNumber = require('./common').subNumber
const apiErrors = require('./common').apiErrors

const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()
const smallCatchesApi = new SmallCatchesApi()
const methodsApi = new MethodsApi()

module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  const cache = await request.cache().get()
  let monthForApi

  if (!payload.month.trim()) {
    errors.push({ months: 'INVALID' })
    monthForApi = null
  } else if (isNaN(payload.month)) {
    errors.push({ months: 'INVALID' })
    monthForApi = null
  } else if (Number.parseInt(payload.month) < 1 || Number.parseInt(payload.month) > 12) {
    errors.push({ months: 'INVALID' })
    monthForApi = null
  } else {
    monthForApi = Number.parseInt(payload.month)
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
        if (num && !isNaN(num)) {
          if (num > 0) {
            counts.push({
              method: m.id,
              count: num
            })
          } else if (num < 0) {
            // The API does not handle small catch counts !> 0 with enough precision for the messaging
            errors.push(new function () {
              this[m.name] = 'SMALL_CATCH_COUNTS_NOT_GREATER_THAN_ZERO'
            }())
          }
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

  const submission = await submissionsApi.getById(request, cache.submissionId)
  const activities = await activitiesApi.getFromLink(request, submission._links.activities.href)

  // Get the activity from the river id
  const activityId = (() => {
    const activity = activities.find(a => a.river.id === payload.river)
    return activity ? activity.id : null
  })()

  /*
   * Add or change the result in the API merging any validation errors
   */
  let result
  if (cache.smallCatch) {
    result = await smallCatchesApi.change(request,
      cache.smallCatch.id,
      activityId,
      monthForApi,
      counts,
      subNumber(payload.released)
    )
  } else {
    result = await smallCatchesApi.add(request,
      cache.submissionId,
      activityId,
      monthForApi,
      counts,
      subNumber(payload.released)
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
      return errors.concat(res.filter(r => !r.invalidValue).concat(ret).sort((a, b) => {
        const ord = { Fly: 1, Spinner: 2, Bait: 3, Unknown: 4, SmallCatch: 5 }
        const ao = ord[Object.keys(a)[0]]
        const bo = ord[Object.keys(b)[0]]
        return (ao - bo) / Math.abs(ao - bo)
      }))
    } else {
      return errors.concat(res)
    }
  } else {
    return errors.length ? errors : null
  }
}
