/**
 * Base controller class.
 *
 * It handles errors and calls the assigned validator on post
 * The async preValidateFunction can be used to operate on the payload before
 * validation
 * if exists
 */
const logger = require('node-js-logger')

module.exports = class BaseHandler {
  constructor ([viewpath, validator, preValidateFunction]) {
    this.path = viewpath
    this.validator = validator
    this.preValidateFunction = preValidateFunction
    this.handler = async (request, h) => {
      try {
        let errors
        if (request.method.toUpperCase() === 'GET') {
          return this.doGet(request, h)
        } else {
          if (this.preValidateFunction) {
            await this.preValidateFunction(request.payload)
          }
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
