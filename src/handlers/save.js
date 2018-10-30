'use strict'

/**
 * Display the saved data message.
 * N.B. This does not save anything!
 */
const BaseHandler = require('./base')

module.exports = class SaveHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * If external user zap the session and display the save page. If a
   * fish management team user then just go back to teh licence selector
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    if (process.env.CONTEXT === 'FMT') {
      return h.redirect('/licence')
    }
    await request.cache().drop()
    request.cookieAuth.clear()
    return h.view(this.path)
  }
}
