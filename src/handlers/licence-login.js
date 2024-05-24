'use strict'

/**
 * Ask the user for their fish licence number and postcode
 */
const BaseHandler = require('./base')
const authenticateUser = require('../lib/authenticate-user')

module.exports = class LicenceAuthHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Display the licence/postcode authentication page
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return h.view(this.path)
  }

  /**
   * If the licence and postcode have been authenticated using the
   * validator then assign a session identifier to the authorization cookie
   * and redirect to the start of the authenticated journey
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    if (errors) {
      return h.redirect('/licence-auth-fail')
    }

    // No errors so we can authenticate this user
    await authenticateUser(request)
    return h.redirect('/select-year')
  }

  /**
   * This is the high level handler function
   * @param request
   * @param h
   * @returns {Promise<*>}
   */
  async handler (request, h) {
    console.log('licence-login handler', `${request.method.toUpperCase()} request`)
    try {
      let errors
      if (request.method.toUpperCase() === 'GET') {
        console.log('calling this.doGet')
        return await this.doGet(request, h)
      } else {
        if (this.validator) {
          console.log('validating')
          errors = await this.validator(request, h)
          console.log('validated', errors)
        }
        return await this.doPost(request, h, errors)
      }
    } catch (err) {
      console.log('ERROR!', err)
      // Crypto error
      if (err instanceof CryptoError) {
        logger.error(err)
        return h.redirect('/')
      }

      // Response error
      if (err instanceof ResponseError.Error) {
        logger.debug(err)
        return h.redirect(`/error/${err.statusCode}`)
      } else {
        throw err
      }
    }
  }
}
