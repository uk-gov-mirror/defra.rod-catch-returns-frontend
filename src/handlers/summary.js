'use strict'

/**
 * Summary handler
 */
const BaseHandler = require('./base')

const rivers = [
  {
    id: 3,
    name: 'Derwent (Cumbria)',
    daysFished: 10
  },
  {
    id: 2,
    name: 'Trent',
    daysFished: 4
  }
]

const salmonAndLargeTrout = [
  {
    id: 0,
    river: 'Derwent (Cumbria)',
    date: '08/18',
    type: 'Salmon',
    weight: '10lb 2oz',
    released: true,
    method: 'Fly'
  },
  {
    id: 1,
    river: 'Trent',
    date: '03/18',
    type: 'Salmon',
    weight: '10lb 8oz',
    released: false,
    method: 'Spinner'
  }
]

module.exports = class SummaryHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for the summary page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    await super.clearCache(request)
    return h.view(this.path, { rivers, salmonAndLargeTrout })
  }

  /**
   * Post handler for the summary page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    return h.redirect('/submission')
  }
}
