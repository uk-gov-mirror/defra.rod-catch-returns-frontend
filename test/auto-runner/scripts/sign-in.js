'use strict'

const requests = require('./requests')

module.exports = {
  first: requests.start
    .concat(requests.signInFail)
    .concat(requests.signInSuccess),

  subsequent: requests.start
    .concat(requests.signInWithActivity),

  locked: requests.start
    .concat(requests.signInToLocked),

  fmt: requests.fmtStart
    .concat(requests.fmtSignInFail)
    .concat(requests.fmtSignIn)
    .concat(requests.fmtSignOut),

  fmtSubsequent: requests.fmtSignIn

}
