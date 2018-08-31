/**
 * Display the declaration page
 */
const BaseHandler = require('./base')

module.exports = class SubmissionHandler extends BaseHandler {
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
    return h.view(this.path)
  }

  /**
   * Sets the finalize statue for the rod catch return
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doPost (request, h) {
    return h.redirect('/confirmation')
  }
}
