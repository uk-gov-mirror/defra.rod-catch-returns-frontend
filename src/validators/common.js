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
          apiErr[e.entity] = e.message
          if (e.property) {
            apiErr.property = e.property
          }
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

  /**
   * Replaces blanks with zero.
   * Tests for not a number.
   * @param label - The label to assign to the error
   * @param num - The number to test
   * @param errors - Pushes the error onto errors
   * @returns {*} The number you first thought of
   */
  checkNumber: (label, num, errors) => {
    if (!num || !num.trim()) {
      return 0
    } else if (isNaN(num)) {
      let err = {}
      err[label] = 'NOT_A_NUMBER'
      errors.push(err)
      return num
    }
    return num
  }
}
