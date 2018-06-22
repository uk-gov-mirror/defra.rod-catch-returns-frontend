const BaseHandler = require('./base')
const logger = require('../lib/logging').logger

module.exports = class LicenceHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  async doGet (request, h) {
    logger.info('Get handler')
    return h.view(this.path)
  }

  async doPost (request, h, cacheState) {
    logger.info('Post handler')
    return h.redirect('/licence')
  }
}
