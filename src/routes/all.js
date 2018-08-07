/**
 * These routes are scanned automatically by the hapi-router
 */
const LicenceHandler = require('../handlers/licence')
const licenceValidator = require('../validators/licence')
const licenceHandler = new LicenceHandler('licence', licenceValidator)

const ReturnHandler = require('../handlers/return')
const returnHandler = new ReturnHandler('return')

module.exports = [

  // Redirect to the start page
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

  // Returns handler
  {
    path: '/return',
    method: 'GET',
    handler: returnHandler.handler
  },

  // Error handler
  {
    path: '/error',
    method: 'GET',
    handler: (request, h) => {
      return h.view('error')
    }
  },

  // Catch all
  {
    method: '*',
    path: '/{p*}',
    handler: function (request, h) {
      return h.redirect('/')
    }
  }

]
