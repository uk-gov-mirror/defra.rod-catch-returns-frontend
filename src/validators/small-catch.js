'use strict'

/**
 * Validate the small catch
 */
const SubmissionsApi = require('../api/submissions')
const ActivitiesApi = require('../api/activities')
const SmallCatchesApi = require('../api/small-catches')
const MethodsApi = require('../api/methods')
const { isInt, subNumber, apiErrors, getSorterForApiErrors } = require('./common')
const submissionsApi = new SubmissionsApi()
const activitiesApi = new ActivitiesApi()
const smallCatchesApi = new SmallCatchesApi()
const methodsApi = new MethodsApi()

/**
 * recombines what was sent to the API with the result returned from the API
 * @param errors
 * @param apiCounts
 * @param apiIgnore
 * @param methods
 * @returns {*}
 */
const apiMethodErrorRemapper = (errors, apiCounts, apiIgnore, methods) => {
  const propCount = /counts\[([0-4])\]\.count/
  return errors
    // Filter out results we want to ignore because we will use a front end generated error
    .filter(e => {
      const search = propCount.exec(e.property)
      if (!search || !apiIgnore.length) {
        return true
      } else {
        // Locate the position in the API ignore array
        return !apiIgnore.includes(Number.parseInt(search[1]))
      }
    })
    .map(e => {
      const search = propCount.exec(e.property)
      if (!search) {
        return e
      } else {
        // Locate the position in the API array
        const apiReqItem = apiCounts[Number.parseInt(search[1])]
        // Find method
        const method = methods.find(m => m.id === apiReqItem.method)
        // Manipulate message
        e.SmallCatch = e.SmallCatch.replace('_COUNTS_', '_' + method.name.toUpperCase() + '_COUNT_')
        return e
      }
    })
}

const calculateMonth = payload => {
  const month = parseInt(payload.month)
  if (month <= 12 && month >= 1) {
    return month
  }
  return null
}

module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  const cache = await request.cache().get()
  const monthForApi = calculateMonth(payload)

  /*
   * Check methods - allow blanks in the input which will be translated to zeroes for display purposes
   * but don't create entries in the counts array where the number is not set
   * because the API will not accept them. Otherwise we assign to counts and allow the API to perform validation
   */
  const methods = await methodsApi.list(request)
  const apiCounts = []
  const apiIgnore = []

  const apiNames = Object.keys(payload)
  for (const method of methods) {
    const name = method.name.toLowerCase()
    if (apiNames.includes(name)) {
      const count = parseInt(payload[name]) || null
      apiCounts.push({
        count,
        method: method.id
      })
      if (count === null) {
        apiIgnore.push(apiCounts.length - 1)
        errors.push({ SmallCatch: `SMALL_CATCH_${method.name.toUpperCase()}_COUNT_INVALID` })
      }
    }
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
  const catchId = cache.smallCatch ? cache.smallCatch.id : cache.submissionId
  const result = await smallCatchesApi(
    request,
    catchId,
    activityId,
    monthForApi,
    apiCounts,
    subNumber(payload.released),
    Object.keys(payload).includes('noMonthRecorded')
  )

  const sorter = getSorterForApiErrors('SmallCatch',
    'ACTIVITY',
    'MONTH',
    'COUNTS',
    'FLY',
    'SPINNER',
    'BAIT',
    'UNKNOWN',
    'RELEASED')

  if (Object.keys(result).includes('errors')) {
    const reMappedApiErrors = apiMethodErrorRemapper(apiErrors(result),
      apiCounts, apiIgnore, methods)

    return errors.concat(reMappedApiErrors).sort(sorter)
  } else {
    return errors.length ? errors : null
  }
}
