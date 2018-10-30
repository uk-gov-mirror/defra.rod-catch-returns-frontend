'use strict'

const requests = require('./requests')
const signIn = require('./sign-in')

module.exports = signIn.subsequent.concat(requests.save)
