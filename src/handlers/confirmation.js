/**
 * Display the confirmation page
 */
const BaseHandler = require('./base')

module.exports = class ConfirmHandler extends BaseHandler {
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
    return h.view(this.path, { reference: 'TYHY44' })
  }
}
