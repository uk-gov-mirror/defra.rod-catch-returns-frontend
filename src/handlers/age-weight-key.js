'use strict'
const { logger } = require('defra-logging-facade')
const Fs = require('fs')
const moment = require('moment')
/**
 * Display the age weight key upload page
 */
const BaseHandler = require('./base')

module.exports = class AgeWeightKeyHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  removeTempFile (request) {
    Fs.unlinkSync(request.payload.upload.path)
    logger.debug(`Removed temporary file: ${request.payload.upload.path}`)
  }

  /**
   * Get handler for age weight key upload
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()
    const key = cache.payload && cache.payload.key ? cache.payload.key : ''
    const year = cache.payload && cache.payload.year ? cache.payload.year : ''

    const keys = ['Dee', 'Tamar']

    const now = moment()
    const years = [-2, 2].map(y => (now.year() + y).toString())

    return this.readCacheAndDisplayView(request, h, { key, year, keys, years })
  }

  async doPost (request, h, errors) {
    let cache = await request.cache().get()
    cache.ageWeightKey = {
      filename: request.payload.upload.filename,
      year: request.payload.year,
      key: request.payload.key
    }
    cache.payload = request.payload
    await request.cache().set(cache)

    if (cache.ageWeightKeyConflict) {
      return h.redirect('/age-weight-key-conflict-check')
    } else {
      this.removeTempFile(request)
      return AgeWeightKeyHandler.writeCacheAndRedirect(request, h, errors, '/age-weight-key-ok', '/age-weight-key')
    }
  }
}
