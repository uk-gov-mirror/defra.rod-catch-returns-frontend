'use strict'

const uuid = require('uuid/v4')
const { logger } = require('defra-logging-facade')

/**
 * Sets up the cache and cookies for an authenticated user
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
module.exports = async (request, h, contact) => {
  // Generate a new session identifier
  const sid = uuid()

  // Assign a new user
  const user = { contactId: contact.contact.id }

  // Set the cookie to the session identifier
  request.cookieAuth.set({ sid: sid })

  // Set the server cache to the contact details
  await request.cache().set(user)

  logger.debug('Licence holder is authenticated: ' + JSON.stringify(user))

  return h.redirect('/select-year')
}
