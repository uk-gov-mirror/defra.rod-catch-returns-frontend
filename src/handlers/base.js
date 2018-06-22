const logger = require('../lib/logging').logger

module.exports = class BaseHandler {
  constructor ([viewpath, validator]) {
    this.path = viewpath
    this.validator = validator
  }

  async handler (request, h) {
    try {
      let errors
      if (request.method.toUpperCase() === 'GET') {
        return this.doGet(request, h)
      } else {
        if (this.validator) {
          errors = await this.validator(request.payload)
        }
        return this.doPost(request, h, errors)
      }
    } catch (err) {
      logger.error(err)
    }
  }
}

