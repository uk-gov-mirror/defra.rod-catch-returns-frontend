'use strict'

const uuid = require('uuid/v4')
const Crypto = require('./crypto')

const { logger } = require('defra-logging-facade')
/**
 * Sets up the cache and the session cookies for an authenticated user
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
module.exports = async (request) => {
  if (!request.app.authorization) {
    throw new Error('Cannot set up session cookie and cache for an unauthenticated user')
  }

  // Generate a new session identifier
  const sid = uuid()

  // Assign a new user
  const cache = { authorization: await Crypto.writeObj(request.server.app.cache, request.app.authorization) }

  // Set the cookie to the session identifier
  request.cookieAuth.set({ sid: sid })

  // Set the server cache to the contact details
  await request.cache().set(cache)
  logger.debug('User is authenticated: ' + JSON.stringify(request.app.authorization.username))
}
