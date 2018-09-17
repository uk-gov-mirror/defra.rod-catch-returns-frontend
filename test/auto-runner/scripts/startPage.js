'use strict'

module.exports = [
  {
    'path': '/',
    'status': 302,
    'method': 'GET',
    'redirect': '/licence'
  },

  {
    'path': '/licence',
    'status': 302,
    'method': 'POST',
    'payload': {
      'licence': 'B7A718',
      'postcode': 'WA4 1HT'
    },
    'redirect': '/select-year'
  },

  {
    'path': '/select-year',
    'status': 302,
    'method': 'GET',
    'redirect': '/did-you-fish'
  },

  {
    'path': '/did-you-fish',
    'status': 302,
    'method': 'POST',
    'payload': { 'dyf': 'YES' },
    'redirect': '/summary'
  }
]
