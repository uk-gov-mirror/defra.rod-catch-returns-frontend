'use strict'

const requests = require('./requests')

module.exports = requests.start
  .concat(requests.signInFail)
  .concat(requests.signInSuccess)
