'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.first
  .concat(requests.addActivityRiverScalbyBeck)
  .concat(requests.addActivityRiverErrors)
  .concat(requests.editActivityRiverScalbyBeck)
  .concat(requests.addActivityRiverEbbw)
  .concat(requests.addActivityRiverAmman)
  .concat(requests.addActivityRiverAber)
  .concat(requests.deleteActivityRiverEbbw)
