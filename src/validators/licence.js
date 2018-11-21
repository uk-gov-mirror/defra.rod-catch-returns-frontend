'use strict'

const LicenceApi = require('../api/licence')
const ResponseError = require('../handlers/response-error')

/**
 * Validate the licence number and postcode
 */
module.exports = async (request) => {
  const payload = request.payload
  const errors = []
  console.log(JSON.stringify(request))

  // Unmatched licence number
  if (!payload.licence) {
    errors.push({ licence: 'EMPTY' })
  } else if (!payload.postcode) {
    errors.push({ postcode: 'EMPTY' })
  } else {
    // Set up the contact id for the licence in the cache
    try {
      payload.contact = await LicenceApi.getContactFromLicenceKey(request, payload.licence, payload.postcode)
    } catch (err) {
      if (err.statusCode === ResponseError.status.NOT_FOUND || err.statusCode === ResponseError.status.FORBIDDEN) {
        errors.push({ licence: 'NOT_FOUND' })
        return errors
      } else {
        return null
      }
    }
    return null
  }

  return errors
}
