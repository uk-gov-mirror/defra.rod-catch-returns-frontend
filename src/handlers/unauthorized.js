'use strict'

/**
 * Throw when user is attempting to access a resource that they don't own
 * @type {module.UnauthorizedError}
 */
module.exports = class UnauthorizedError extends Error {
  constructor (message) {
    super(message)
    this.statusCode = 403
    this.name = 'Request unauthorized'
  }
}
