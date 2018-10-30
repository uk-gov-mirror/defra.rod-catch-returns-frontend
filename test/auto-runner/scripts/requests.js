'use strict'

/**
 * Reusable fragments for tests
 * @type {string}
 */

const LICENCE = String('B7A718')
const POSTCODE = String('WA41HT')
const YEAR = require('moment')().year()

module.exports = {
  LICENCE: LICENCE,
  POSTCODE: POSTCODE,
  start: [
    { method: 'GET', path: '/', status: 302, redirect: '/licence-auth' },
    { method: 'GET', path: '/licence-auth', status: 200 }
  ],
  signInSuccess: [
    { method: 'GET', path: '/licence-auth', status: 200 },
    { method: 'POST', path: '/licence-auth', status: 302, payload: { licence: LICENCE, postcode: POSTCODE }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 200 },
    { method: 'POST', path: '/select-year', status: 302, payload: { year: YEAR }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 200 },
    { method: 'POST', path: '/did-you-fish', status: 302, payload: { dyf: 'YES' }, redirect: '/summary' }
  ],
  signInWithActivity: [
    { method: 'GET', path: '/licence-auth', status: 200 },
    { method: 'POST', path: '/licence-auth', status: 302, payload: { licence: LICENCE, postcode: POSTCODE }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 200 },
    { method: 'POST', path: '/select-year', status: 302, payload: { year: YEAR }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 302, redirect: '/summary' }
  ],
  signInFail: [
    { method: 'POST', path: '/licence-auth', status: 302, payload: { licence: 'A7A718', postcode: 'WA4 1HT' }, redirect: '/licence-auth-fail' }
  ],
  signInToLocked: [
    { method: 'GET', path: '/licence-auth', status: 200 },
    { method: 'POST', path: '/licence-auth', status: 302, payload: { licence: LICENCE, postcode: POSTCODE }, redirect: '/select-year' },
    { method: 'GET', path: '/select-year', status: 200 },
    { method: 'POST', path: '/select-year', status: 302, payload: { year: YEAR }, redirect: '/did-you-fish' },
    { method: 'GET', path: '/did-you-fish', status: 302, redirect: '/review' },
    { method: 'GET', path: '/review', status: 200 }
  ],
  addActivityRiverSawdde: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/189', daysFishedOther: '7', daysFishedWithMandatoryRelease: '0' }, status: 302, redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addActivityRiverErrors: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: '', daysFishedOther: '1000', daysFishedWithMandatoryRelease: '' }, status: 302, redirect: '/activities/add' }
  ],
  editActivityRiverSawdde: [
    { method: 'GET', path: '/activities/1', status: 200 },
    { method: 'POST', path: '/activities/1', payload: { river: 'rivers/190', daysFishedOther: '3', daysFishedWithMandatoryRelease: '10' }, status: 302, redirect: '/summary' }
  ],
  addActivityRiverEbbw: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/87', daysFishedOther: '6', daysFishedWithMandatoryRelease: '2' }, status: 302, redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addActivityRiverAmman: [
    { method: 'GET', path: '/activities/add', status: 200 },
    { method: 'POST', path: '/activities/add', payload: { river: 'rivers/11', daysFishedOther: '2', daysFishedWithMandatoryRelease: '0' }, status: 302, redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  deleteActivityRiverEbbw: [
    { method: 'GET', path: '/delete/activities/2', status: 200 },
    { method: 'POST', path: '/delete/activities/2', payload: {}, status: 302, redirect: '/summary' }
  ],
  addSmallCatchJune: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/190', month: 'JUNE', fly: '5', spinner: '2', bait: '', released: '1' },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addSmallCatch2June: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/11', month: 'JUNE', fly: '', spinner: '2', bait: '', released: '1' },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addSmallCatchErrors: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/190', month: '', fly: 'a', spinner: '', bait: '', released: '' },
      status: 302,
      redirect: '/small-catches/add' }
  ],
  editSmallCatchJune: [
    { method: 'GET', path: '/small-catches/1', status: 200 },
    { method: 'POST',
      path: '/small-catches/1',
      payload: { river: 'rivers/190', month: 'JUNE', fly: '2', spinner: '2', bait: '1', released: '2' },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addSmallCatchJuly: [
    { method: 'GET', path: '/small-catches/add', status: 200 },
    { method: 'POST',
      path: '/small-catches/add',
      payload: { river: 'rivers/190', month: 'JULY', fly: '5', spinner: '2', bait: '', released: '1' },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  deleteSmallCatchJuly: [
    { method: 'GET', path: '/delete/small-catches/2', status: 200 },
    { method: 'POST', path: '/delete/small-catches/2', payload: {}, status: 302, redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addLargeCatchJune: [
    { method: 'GET', path: '/catches/add', status: 200 },
    { method: 'POST',
      path: '/catches/add',
      payload: {
        river: 'rivers/190',
        'date-day': '1',
        'date-month': '6',
        type: 'species/1',
        system: 'IMPERIAL',
        pounds: '1',
        ounces: '2',
        kilograms: '',
        method: 'methods/2',
        released: 'true'
      },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addLargeCatch2June: [
    { method: 'GET', path: '/catches/add', status: 200 },
    { method: 'POST',
      path: '/catches/add',
      payload: {
        river: 'rivers/11',
        'date-day': '1',
        'date-month': '6',
        type: 'species/1',
        system: 'IMPERIAL',
        pounds: '1',
        ounces: '2',
        kilograms: '',
        method: 'methods/2',
        released: 'true'
      },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addLargeCatchErrors: [
    { method: 'GET', path: '/catches/add', status: 200 },
    { method: 'POST',
      path: '/catches/add',
      payload: {
        river: 'rivers/190',
        'date-day': '1',
        'date-month': '13',
        type: 'species/1',
        system: 'IMPERIAL',
        pounds: '1',
        ounces: '2',
        kilograms: '',
        method: 'methods/2',
        released: 'true'
      },
      status: 302,
      redirect: '/catches/add' }
  ],
  addLargeCatchErrors2: [
    { method: 'GET', path: '/catches/add', status: 200 },
    { method: 'POST',
      path: '/catches/add',
      payload: {
        river: 'rivers/190',
        'date-day': '1',
        'date-month': '6',
        type: 'species/1',
        system: 'METRIC',
        pounds: '',
        ounces: '',
        kilograms: '150',
        method: 'methods/2',
        released: 'true'
      },
      status: 302,
      redirect: '/catches/add' }
  ],
  editLargeCatchJune: [
    { method: 'GET', path: '/catches/1', status: 200 },
    { method: 'POST',
      path: '/catches/1',
      payload: {
        river: 'rivers/11',
        'date-day': '1',
        'date-month': '6',
        type: 'species/2',
        system: 'IMPERIAL',
        pounds: '1',
        ounces: '3',
        kilograms: '',
        method: 'methods/1',
        released: 'false'
      },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  addLargeCatchJuly: [
    { method: 'GET', path: '/catches/add', status: 200 },
    { method: 'POST',
      path: '/catches/add',
      payload: {
        river: 'rivers/190',
        'date-day': '1',
        'date-month': '7',
        type: 'species/1',
        system: 'IMPERIAL',
        pounds: '0',
        ounces: '9',
        kilograms: '',
        method: 'methods/2',
        released: 'true'
      },
      status: 302,
      redirect: '/summary' },
    { method: 'GET', path: '/summary', status: 200 }
  ],
  deleteLargeCatchJuly: [
    { method: 'GET', path: '/delete/catches/2', status: 200 },
    { method: 'POST', path: '/delete/catches/2', payload: {}, status: 302, redirect: '/summary' }
  ],
  save: [
    { method: 'GET', path: '/summary', status: 200 },
    { method: 'GET', path: '/save', status: 200 }
  ],
  reviewAndSubmit: [
    { method: 'GET', path: '/summary', status: 200 },
    { method: 'POST', path: '/summary', payload: {}, status: 302, redirect: '/review' },
    { method: 'GET', path: '/review', status: 200 },
    { method: 'POST', path: '/review', payload: {}, status: 302, redirect: '/confirmation' },
    { method: 'GET', path: '/confirmation', status: 200 }
  ]
}
