'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.subsequent
  .concat(requests.addSmallCatchJune)
  .concat(requests.addSmallCatch2June)
  .concat(requests.addSmallCatchErrors)
  .concat(requests.addSmallCatchErrors2)
  .concat(requests.editSmallCatchJune)
  .concat(requests.addSmallCatchJuly)
  .concat(requests.deleteSmallCatchJuly)
