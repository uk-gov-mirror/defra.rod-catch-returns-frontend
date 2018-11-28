'use strict'

/**
 * Display the declaration page
 */
const Moment = require('moment')

const BaseHandler = require('./base')
const SubmissionsApi = require('../api/submissions')
const CatchesApi = require('../api/catches')
const SmallCatchesApi = require('../api/small-catches')
const ActivitiesApi = require('../api/activities')
const printWeight = require('./common').printWeight

const submissionsApi = new SubmissionsApi()
const catchesApi = new CatchesApi()
const smallCatchesApi = new SmallCatchesApi()
const activitiesApi = new ActivitiesApi()

// Calculate calendar months
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    value: mth.toUpperCase(),
    text: mth
  }
})

module.exports = class ReviewHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for main page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return this.reviewReturn(request, h)
  }

  async reviewReturn (request, h) {
    const cache = await request.cache().get()
    cache.back = request.path
    await request.cache().set(cache)

    let submission = await submissionsApi.getById(request, cache.submissionId)

    // Get the activities
    const activities = await activitiesApi.getFromLink(request, submission._links.activities.href)

    // Add a count to the activities
    activities.map(a => { a.count = 0 })

    // Process the catches for the summary view
    const catches = (await catchesApi.getFromLink(request, submission._links.catches.href)).map(c => {
      c.dateCaught = Moment(c.dateCaught).format('DD/MM')
      c.weight = printWeight(c)
      const activity = activities.find(a => a.id === c.activity.id)
      activity.count++
      return c
    })

    let foundInternal = false
    const smallCatches = (await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)).map(c => {
      c.month = months.find(m => m.value === c.month).text
      c.river = c.activity.river.name
      const activity = activities.find(a => a.id === c.activity.id)
      c.counts.forEach(t => {
        c[t.name.toLowerCase()] = t.count
        activity.count += t.count || 0
      })
      foundInternal = foundInternal || !!c.counts.find(m => m.internal)
      delete c.counts
      return c
    })

    // Return the review details
    return h.view(this.path, {
      year: cache.year,
      activities: activities.sort(activitiesApi.sort),
      catches: catches.sort(catchesApi.sort),
      smallCatches: smallCatches.sort(smallCatchesApi.sort),
      foundInternal: foundInternal,
      locked: !!cache.locked,
      reportingExclude: submission.reportingExclude,
      details: {
        licenceNumber: cache.licenceNumber,
        postcode: cache.postcode,
        year: cache.year
      }
    })
  }

  /**
   * Sets the finalize statue for the rod catch return
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    if (Object.keys(request.payload).includes('continue')) {
      const cache = await request.cache().get()
      cache.locked = true
      await request.cache().set(cache)
      await submissionsApi.setSubmitted(request, cache.submissionId)
      return h.redirect('/confirmation')
    } else if (Object.keys(request.payload).includes('unlock') && process.env.CONTEXT === 'FMT') {
      const cache = await request.cache().get()
      cache.locked = false
      await request.cache().set(cache)
      await submissionsApi.setIncomplete(request, cache.submissionId)
      return h.redirect('/summary')
    } else {
      throw new Error('Lock operation not permitted')
    }
  }
}
