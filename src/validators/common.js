'use strict'

/**
 * Common functions for validators
 */

module.exports = {
  apiErrors: (err, errors) => {
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
  },

  checkNumber: (label, num, errors) => {
    if (!num || !num.trim()) {
      let err = {}
      err[label] = 'EMPTY'
      errors.push(err)
    } else if (Number.isNaN(Number.parseInt(num))) {
      let err = {}
      err[label] = 'NOT_A_NUMBER'
      errors.push(err)
    }
  }
}
