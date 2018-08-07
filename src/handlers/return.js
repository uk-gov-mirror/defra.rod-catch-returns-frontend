/**
 * Start of authenticated journey
 */
const BaseHandler = require('./base')

module.exports = class ReturnHandler extends BaseHandler {
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
  async doGet (request, h, user) {
    console.log('User in handler: ' + JSON.stringify(user))
    return h.view(this.path)
  }
}
