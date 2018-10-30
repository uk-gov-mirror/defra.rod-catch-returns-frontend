'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.first
  .concat(requests.addActivityRiverSawdde)
  .concat(requests.addActivityRiverErrors)
  .concat(requests.editActivityRiverSawdde)
  .concat(requests.addActivityRiverEbbw)
  .concat(requests.addActivityRiverAmman)
  .concat(requests.deleteActivityRiverEbbw)
