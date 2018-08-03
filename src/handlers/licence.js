/**
 * Ask the user for there fish licence number and postcode
 */
const uuid = require('uuid/v4')

const BaseHandler = require('./base')

module.exports = class LicenceHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  async doGet (request, h) {
    return h.view(this.path)
  }

  async doPost (request, h, errors) {
    if (!errors) {
      request.cookieAuth.set({sid: uuid()})
      return h.redirect('/return')
    }

    return h.redirect('/')
  }
}
