/**
 * These routes are scanned automatically by the hapi-router
 */
const LicenceHandler = require('../handlers/licence')
const ReturnHandler = require('../handlers/return')
const YearHandler = require('../handlers/year')
const SummaryHandler = require('../handlers/summary')

// Define the validators
const licenceValidator = require('../validators/licence')
const yearValidator = require('../validators/year')

// Define the handlers
const licenceHandler = new LicenceHandler('licence', licenceValidator)
const yearHandler = new YearHandler('select-year', yearValidator)
const returnHandler = new ReturnHandler('return')
const summaryHandler = new SummaryHandler('summary')

module.exports = [

  // Redirect to the start page
  {
    path: '/',
    method: 'GET',
    options: { auth: false },
    handler: (request, h) => {
      return h.redirect('/licence')
    }
  },

  // Licence handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandler.handler,
    options: { auth: false }
  },

  // Year handler
  {
    path: '/select-year',
    method: ['GET', 'POST'],
    handler: yearHandler.handler
  },

  // Summary handler
  {
    path: '/summary',
    method: ['GET', 'POST'],
    handler: summaryHandler.handler
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
    options: { auth: false },
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
