'use strict'

const Moment = require('moment')
const months = [ ...Array(12).keys() ].map(m => {
  const mth = Moment({ month: m }).format('MMMM')
  return {
    num: m + 1,
    key: mth.toUpperCase(),
    text: mth
  }
})

/**
 * General functions
 */
module.exports = {
  printWeight: (c) => {
    if (c.mass.type === 'IMPERIAL') {
      let lbs = Math.floor(c.mass.oz / 16).toString()
      let oz = Math.round(c.mass.oz % 16)
      if (oz === 16) {
        ++lbs
        oz = 0
      }
      return lbs + 'lbs ' + oz + 'oz'
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

  monthUtils: {
    months,
    find: {
      numFromKey: (k) => months.find(m => m.key === k).num,
      keyFromNum: (n) => months.find(m => m.num === Number.parseInt(n)).key,
      textFromNum: (n) => months.find(m => m.num === Number.parseInt(n)).text
    }
  },

  isAllowedParam: (param) => {
    return !isNaN(param) || param === 'add'
  }
}
