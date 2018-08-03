const LicenceHandler = require('../handlers/licence')
const licenceValidator = require('../validators/licence')

const licenceHandler = new LicenceHandler('licence', licenceValidator)

module.exports = [

  // Test handler for direct output
  {
    path: '/',
    method: 'GET',
    handler: (request, h) => {
      return h.redirect('/licence')
    }
  },

  // Licence handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandler.handler,
    options: {
      auth: { mode: 'try' },
      plugins: {
        'hapi-auth-cookie': { redirectTo: false }
      }
    }
  },

  // Returns handler - placeholder
  {
    path: '/return',
    method: 'GET',
    handler: (request, h) => {
      return h.view('return')
    }
  },

  // Error handler
  {
    path: '/error',
    method: 'GET',
    handler: (request, h) => {
      return h.view('error')
    }
  }

]
