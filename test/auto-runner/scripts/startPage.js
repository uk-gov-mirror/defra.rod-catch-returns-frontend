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
      'licence': 'Gibberish',
      'postcode': 'blah'
    },
    'redirect': '/return'
  }
]
