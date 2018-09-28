'use strict'

/**
 * Reusable fragments for tests
 * @type {string}
 */

const LICENCE = String('B7A718')
const POSTCODE = String('WA4 1HT')
const YEAR = require('moment')().year()

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
    { method: 'POST', path: '/select-year', status: 302, payload: { year: YEAR }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 200 },
    { method: 'POST', path: '/did-you-fish', status: 302, payload: { dyf: 'YES' }, redirect: '/summary' }
  ],
  signInWithActivity: [
    { method: 'GET', path: '/licence', status: 200 },
    { method: 'POST', path: '/licence', status: 302, payload: { licence: LICENCE, postcode: POSTCODE }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 200 },
    { method: 'POST', path: '/select-year', status: 302, payload: { year: YEAR }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 302, redirect: '/summary' }
  ],
  signInFail: [
    { method: 'POST', path: '/licence', status: 302, payload: { licence: 'A7A718', postcode: 'WA4 1HT' }, redirect: '/licence-not-found' }
  ],
  addActivityRiverSawdde: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/189', days: '7' }, status: 302, redirect: '/summary' }
  ],
  addActivityRiverErrors: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: '', days: '' }, status: 302, redirect: '/activities/add' }
  ],
  editActivityRiverSawdde: [
    { method: 'GET', path: '/activities/1', status: 200 },
    { method: 'POST', path: '/activities/1', payload: { river: 'rivers/189', days: '3' }, status: 302, redirect: '/summary' }
  ],
  addActivityRiverEbbw: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/87', days: '2' }, status: 302, redirect: '/summary' }
  ],
  deleteActivityRiverEbbw: [
    { method: 'GET', path: '/delete/activities/2', status: 200 },
    { method: 'POST', path: '/delete/activities/2', payload: {}, status: 302, redirect: '/summary' }
  ],
  addSmallCatchJune: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/189', month: 'JUNE', fly: '5', spinner: '2', bait: '', released: '1' },
      status: 302,
      redirect: '/summary' }
  ],
  addSmallCatchErrors: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/189', month: '', fly: '', spinner: '', bait: '', released: '' },
      status: 302,
      redirect: '/small-catches/add' }
  ],
  editSmallCatchJune: [
    { method: 'GET', path: '/small-catches/1', status: 200 },
    { method: 'POST',
      path: '/small-catches/1',
      payload: { river: 'rivers/189', month: 'JUNE', fly: '2', spinner: '2', bait: '1', released: '2' },
      status: 302,
      redirect: '/summary' }
  ],
  addSmallCatchJuly: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/189', month: 'JULY', fly: '5', spinner: '2', bait: '', released: '1' },
      status: 302,
      redirect: '/summary' }
  ],
  deleteSmallCatchJuly: [
    { method: 'GET', path: '/delete/small-catches/2', status: 200 },
    { method: 'POST', path: '/delete/small-catches/2', payload: {}, status: 302, redirect: '/summary' }
  ]
}
