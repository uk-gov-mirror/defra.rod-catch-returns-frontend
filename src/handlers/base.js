/**
 * Base controller class.
 * It handles errors and calls the assigned validator on post
 * if exists
 */
const logger = require('node-js-logger')

module.exports = class BaseHandler {
  constructor ([viewpath, validator]) {
    this.path = viewpath
    this.validator = validator
    this.handler = async (request, h) => {
      try {
        let errors
        if (request.method.toUpperCase() === 'GET') {
          return this.doGet(request, h)
        } else {
          if (this.validator) {
            errors = await this.validator(request.payload)
          }
          return await this.doPost(request, h, errors)
        }
      } catch (err) {
        logger.error(err)
        return h.redirect('/error')
      }
    }
  }
}
