'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.subsequent
  .concat(requests.addLargeCatchJune)
  .concat(requests.addLargeCatchErrors)
  .concat(requests.addLargeCatchErrors2)
  .concat(requests.editLargeCatchJune)
  .concat(requests.addLargeCatch2June)
  .concat(requests.addLargeCatchJuly)
  .concat(requests.deleteLargeCatchJuly)
