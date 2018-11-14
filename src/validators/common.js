'use strict'

/**
 * Common functions for validators
 */

module.exports = {
  /**
   * Create an array of error objects from the result
   * @param result
   * @returns {Array}
   */
  apiErrors: (result) => {
    let errors = []
    result.errors.forEach(e => {
      const apiErr = {}
      apiErr[e.entity] = e.message
      if (e.property) {
        apiErr.property = e.property
      }
      if (e.invalidValue) {
        apiErr.invalidValue = e.invalidValue
      }
      errors.push(apiErr)
    })
    return errors
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
