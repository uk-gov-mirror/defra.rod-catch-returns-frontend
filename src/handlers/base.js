'use strict'

/**
 * Base controller class.
 *
 * It handles errors and calls the assigned validator on post
 * The async preValidateFunction can be used to operate on the payload before
 * validation if exists
 */
const { logger } = require('defra-logging-facade')

module.exports = class BaseHandler {
  constructor ([viewpath, validator]) {
    this.path = viewpath
    this.validator = validator
    this.handler = async (request, h) => {
      try {
        let errors
        if (request.method.toUpperCase() === 'GET') {
          return await this.doGet(request, h)
        } else {
          if (this.validator) {
            errors = await this.validator(request, h)
          }
          return await this.doPost(request, h, errors)
        }
      } catch (err) {
        logger.error(err)
        if (err instanceof require('../lib/crypto').cryptoError) {
          return h.redirect('/')
        }
        return h.redirect('/error500')
      }
    }
  }

  /*
   * If there are errors then append the errors and the original payload to the
   * cache and redirect to the errorPath. Otherwise remove the errors and payload
   * object from the cache and rewrite the cache
   */
  static async writeCacheAndRedirect (request, h, errors, successPath, errorPath) {
    if (errors) {
      // Write the errors into the cache
      let cache = await request.cache().get()
      cache.errors = errors
      cache.payload = request.payload
      await request.cache().set(cache)
      return h.redirect(errorPath)
    }
    let cache = await request.cache().get()
    if (cache.errors || cache.payload) {
      delete cache.errors
      delete cache.payload
      await request.cache().set(cache)
    }
    return h.redirect(successPath)
  }

  /*
   * Append any errors and payload found in the cache object to
   * the page view
   */
  async readCacheAndDisplayView (request, h, pageObj) {
    if (!pageObj) {
      return h.view(this.path)
    }

    if (typeof pageObj !== 'object' || Array.isArray(pageObj)) {
      throw new Error('Page object must be an object')
    }

    let cache = await request.cache().get()
    if (cache.payload || cache.errors) {
      pageObj = Object.assign(pageObj, { payload: cache.payload, errors: cache.errors })
    }
    return h.view(this.path, pageObj)
  }

  /*
   * Allow handlers to clear the cache for a
   * canceled activity
   */
  static async clearCacheErrorsAndPayload (request) {
    let cache = await request.cache().get()
    if (cache.errors || cache.payload) {
      delete cache.errors
      delete cache.payload
      await request.cache().set(cache)
    }
    return cache
  }
}
