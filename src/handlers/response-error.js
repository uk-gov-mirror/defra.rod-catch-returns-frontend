'use strict'

/**
 * Throw when user is attempting to access a resource that they don't own
 * @type {module.UnauthorizedError}
 */
class ResponseError extends Error {
  constructor (message, status) {
    super(message)
    this.statusCode = status
    this.name = 'Request error'
  }
}

module.exports = {
  status: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404
  },
  Error: ResponseError
}
