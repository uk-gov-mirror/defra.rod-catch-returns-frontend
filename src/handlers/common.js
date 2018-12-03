'use strict'

/**
 * General functions
 */
module.exports = {
  printWeight: (c) => {
    if (c.mass.type === 'IMPERIAL') {
      return Math.floor(c.mass.oz / 16).toString() + 'lbs ' + Math.floor(c.mass.oz % 16).toString() + 'oz'
    } else {
      return (Math.round(c.mass.kg * 1000) / 1000).toString() + 'kg'
    }
  },

  testLocked: async (request, cache, submission) => {
    if (!submission) {
      await request.cache().drop()
      request.cookieAuth.clear()
      return false
    }

    if (submission.status === 'SUBMITTED') {
      cache.submissionId = submission.id
      cache.locked = true
      await request.cache().set(cache)
      return true
    }

    return false
  },

  isAllowedParam: (param) => {
    return !isNaN(param) || param === 'add'
  }
}
