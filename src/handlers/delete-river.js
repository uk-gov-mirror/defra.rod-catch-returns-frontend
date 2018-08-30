/**
 * Delete River Handler
 */
const BaseHandler = require('./base')

const river = { id: 2, name: 'Avon' }

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
    return h.view(this.path, { river })
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
