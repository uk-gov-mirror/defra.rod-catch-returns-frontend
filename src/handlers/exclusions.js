'use strict'

/**
 * Write the state of the exclusions flags into the cache
 */
const BaseHandler = require('./base')

module.exports = class ExclusionsHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Post handler for exclusion flags
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    console.log(JSON.stringify(request.payload))
    return null
  }
}
