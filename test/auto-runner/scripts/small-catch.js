'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.subsequent
  .concat(requests.addSmallCatch1)
  .concat(requests.addSmallCatch2)
  .concat(requests.editSmallCatch1)
  .concat(requests.editSmallCatch2WithError)
  .concat(requests.removeSmallCatch1)
  .concat(requests.removeSmallCatch2)
  .concat(requests.addSmallCatchWithErrors1)
  .concat(requests.addSmallCatchWithErrors2)
  .concat(requests.addSmallCatchWithErrors3)
  .concat(requests.addSmallCatchWithErrors4)
