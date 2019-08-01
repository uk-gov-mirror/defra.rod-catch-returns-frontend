'use strict'
const { logger } = require('defra-logging-facade')
const Fs = require('fs')
/**
 * Display the age weight key conflict check
 */
const BaseHandler = require('./base')
const AgeWeightKeyApi = require('../api/age-weight-key')

module.exports = class AgeWeightKeyConflictCheck extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  removeTempFile (filepath) {
    Fs.unlinkSync(filepath)
    logger.debug(`Removed temporary file: ${filepath}`)
  }

  /**
   * Get handler for age weight key error breakdown
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const cache = await request.cache().get()
    const key = cache.ageWeightKey.key ? cache.ageWeightKey.key : ''
    const year = cache.ageWeightKey.year

    return this.readCacheAndDisplayView(request, h, { key, year })
  }

  async doPost (request, h, errors) {
    const overwrite = request.payload.overwrite
    if (overwrite === 'true') {
      const cache = await request.cache().get()
      const filepath = cache[this.context].payload.upload.path
      const year = cache[this.context].payload.year

      await AgeWeightKeyApi.postNew(request, year, filepath, true)

      this.removeTempFile(filepath)

      return this.writeCacheAndRedirect(request, h, false, '/age-weight-key-ok', '')
    } else if (overwrite === 'false') {
      return this.writeCacheAndRedirect(request, h, false, '/age-weight-key', '')
    } else {
      return h.view(this.path, { error: true })
    }
  }
}
