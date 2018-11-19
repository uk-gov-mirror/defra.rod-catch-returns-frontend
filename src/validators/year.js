'use strict'

/**
 * Validate the licence number and postcode
 */

module.exports = async (request) => {
  const payload = request.payload
  if (!payload.year) {
    return { year: 'EMPTY' }
  }
}
