'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.subsequent
  .concat(requests.addSmallCatchJune)
  .concat(requests.addSmallCatchErrors)
  // .concat(requests.editSmallCatchJune)
  .concat(requests.addSmallCatchJuly)
  .concat(requests.deleteSmallCatchJuly)
