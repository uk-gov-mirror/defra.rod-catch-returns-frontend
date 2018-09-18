'use strict'

/**
 * Reusable fragments for tests
 * @type {{start: *[]}}
 */

// Redirect to the licence page
module.exports = {
  start: [
    { method: 'GET', path: '/', status: 302, redirect: '/licence' }
  ],
  signInSuccess: [
    { method: 'POST', path: '/licence', status: 302, payload: { licence: 'B7A718', postcode: 'WA4 1HT' }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 302, redirect: '/did-you-fish' },
    { method: 'POST', path: '/did-you-fish', status: 302, payload: { dyf: 'YES' }, redirect: '/summary' }
  ],
  signInFail: [
    { method: 'POST', path: '/licence', status: 302, payload: { licence: 'A7A718', postcode: 'WA4 1HT' }, redirect: '/licence-not-found' }
  ]
}
