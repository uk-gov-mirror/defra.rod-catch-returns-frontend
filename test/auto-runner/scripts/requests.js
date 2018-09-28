'use strict'

const Moment = require('moment')

/**
 * Reusable fragments for tests
 * @type {string}
 */

const LICENCE = String('B7A718')
const POSTCODE = String('WA4 1HT')

module.exports = {
  LICENCE: LICENCE,
  POSTCODE: POSTCODE,
  start: [
    { method: 'GET', path: '/', status: 302, redirect: '/licence' },
    { method: 'GET', path: '/licence', status: 200 }
  ],
  signInSuccess: [
    { method: 'GET', path: '/licence', status: 200 },
    { method: 'POST', path: '/licence', status: 302, payload: { licence: LICENCE, postcode: POSTCODE }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 200 },
    { method: 'POST', path: '/select-year', status: 302, payload: { year: Moment().year() }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 200 },
    { method: 'POST', path: '/did-you-fish', status: 302, payload: { dyf: 'YES' }, redirect: '/summary' }
  ],
  signInFail: [
    { method: 'POST', path: '/licence', status: 302, payload: { licence: 'A7A718', postcode: 'WA4 1HT' }, redirect: '/licence-not-found' }
  ],
  addActivityRiverSwaddle: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/189', days: '7' }, status: 302, redirect: '/summary' }
  ],
  addActivityRiverErrors: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: null, days: null }, status: 302, redirect: '/activities/add' }
  ],
  editActivityRiverSwaddle: [

  ]
}
