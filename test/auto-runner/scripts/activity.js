'use strict'

const requests = require('./requests')

module.exports = requests.start
  .concat(requests.signInSuccess)
  .concat(requests.addActivityRiverSwaddle)
  .concat(requests.addActivityRiverErrors)
  .concat(requests.editActivityRiverSwaddle)
