'use strict'

/**
 * Display the saved data message
 */
const BaseHandler = require('./base')

module.exports = class SaveHandler extends BaseHandler {
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
    await request.cache().drop()
    request.cookieAuth.clear()
    return h.view(this.path)
  }
}
