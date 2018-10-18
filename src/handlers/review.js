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
    const cache = await request.cache().get()
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

    const smallCatches = (await smallCatchesApi.getFromLink(request, submission._links.smallCatches.href)).map(c => {
      c.month = months.find(m => m.value === c.month).text
      c.river = c.activity.river.name

      const flyCount = c.counts.find(c => c.method.name.toLowerCase() === 'fly')
      c.fly = flyCount ? flyCount.count : null

      const baitCount = c.counts.find(c => c.method.name.toLowerCase() === 'bait')
      c.bait = baitCount ? baitCount.count : null

      const spinnerCount = c.counts.find(c => c.method.name.toLowerCase() === 'spinner')
      c.spinner = spinnerCount ? spinnerCount.count : null

      const activity = activities.find(a => a.id === c.activity.id)
      activity.count = activity.count + (flyCount ? flyCount.count : 0)
      activity.count = activity.count + (baitCount ? baitCount.count : 0)
      activity.count = activity.count + (spinnerCount ? spinnerCount.count : 0)

      delete c.counts
      return c
    })

    // Return the summary view
    return h.view(this.path, { year: cache.year,
      activities: activities.sort(activitiesApi.sort),
      catches: catches.sort(catchesApi.sort),
      smallCatches: smallCatches.sort(smallCatchesApi.sort),
      locked: !!cache.locked
    })
  }

  /**
   * Sets the finalize statue for the rod catch return
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    const cache = await request.cache().get()
    cache.locked = true
    await request.cache().set(cache)
    await submissionsApi.setSubmitted(request, cache.submissionId)
    return h.redirect('/confirmation')
  }
}
