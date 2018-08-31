'use strict'

/**
 * Year handler
 */
const BaseHandler = require('./base')

const years = [
  { value: 2018, text: '2018' },
  { value: 2019, text: '2019' }
]

module.exports = class YearHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for select year page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return super.readCacheAndDisplayView(request, h, { years })
  }

  /**
   * Post handler for the select year page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return super.writeCacheAndRedirect(request, h, errors, '/summary', '/select-year')
  }
}
