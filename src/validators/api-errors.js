'use strict'

/**
 * Processor for collating API exceptions
 * @param err - the exception
 * @param errors - the validation errors array
 * @returns {Promise<void>}
 */
module.exports = (err, errors) => {
  // Check for a status 400 from the API (Error on insert)
  if (err.statusCode && err.statusCode === 400) {
    if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
      err.error.errors.forEach(e => {
        const apiErr = {}
        apiErr[e.entity] = apiErr[e.entity] = e.message
        errors.push(apiErr)
      })
      return errors
    } else {
      throw err
    }
  } else {
    throw err
  }
}