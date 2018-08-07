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
        let user

        /*
         * Attempt to retrieve the user data from the session cache and supply to to all the handlers.
         * If the user is not authenticated or is expired then this will not be set up
         */
        try {
          user = await request.server.app.cache.get(request.auth.artifacts.sid)
        } catch (err) {
          user = null
        }

        if (request.method.toUpperCase() === 'GET') {
          return this.doGet(request, h, user)
        } else {
          if (this.validator) {
            errors = await this.validator(request.payload)
          }
          return await this.doPost(request, h, errors, user)
        }
      } catch (err) {
        logger.error(err)
        return h.redirect('/error')
      }
    }
  }
}
