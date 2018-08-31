'use strict'

/**
 * Delete Salmon and large trout Handler
 */
const BaseHandler = require('./base')

const payload = {
  river: 'Trent',
  type: 'Salmon',
  pounds: 6,
  ounces: 6
}

module.exports = class DeleteRiverHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for delete river page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path, { payload })
  }

  /**
   * Post handler for the delete river page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    return h.redirect('/summary')
  }
}
