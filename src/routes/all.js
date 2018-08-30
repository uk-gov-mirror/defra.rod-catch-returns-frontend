/**
 * These routes are scanned automatically by the hapi-router
 */
const LicenceHandler = require('../handlers/licence')
const ReturnHandler = require('../handlers/return')
const YearHandler = require('../handlers/year')
const SummaryHandler = require('../handlers/summary')
const RiverHandler = require('../handlers/river')
const DeleteRiverHandler = require('../handlers/delete-river')
const SalmonAndLargeTroutHandler = require('../handlers/salmon-and-large-trout')
const DeleteSalmonAndLargeTroutHandler = require('../handlers/delete-salmon-and-large-trout')

// Define the validators
const licenceValidator = require('../validators/licence')
const yearValidator = require('../validators/year')
const riverValidator = require('../validators/river')
const salmonAndLargeTroutValidator = require('../validators/salmon-and-large-trout')

// Define the handlers
const licenceHandler = new LicenceHandler('licence', licenceValidator)
const yearHandler = new YearHandler('select-year', yearValidator)
const returnHandler = new ReturnHandler('return')
const summaryHandler = new SummaryHandler('summary')
const riverHandler = new RiverHandler('river', riverValidator)
const deleteRiverHandler = new DeleteRiverHandler('delete-river', riverValidator)
const salmonAndLargeTroutHandler = new SalmonAndLargeTroutHandler('salmon-and-large-trout', salmonAndLargeTroutValidator)
const deleteSalmonAndLargeTroutHandler = new DeleteSalmonAndLargeTroutHandler('delete-salmon-and-large-trout')

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

  // River handler
  {
    path: '/river',
    method: ['GET', 'POST'],
    handler: riverHandler.handler
  },

  // Delete river handler
  {
    path: '/delete-river/{id}',
    method: ['GET', 'POST'],
    handler: deleteRiverHandler.handler
  },

  // Add/edit salmon and sea trout handler
  {
    path: '/salmon-and-large-trout/{id}',
    method: ['GET', 'POST'],
    handler: salmonAndLargeTroutHandler.handler
  },

  // Delete salmon and sea trout handler
  {
    path: '/salmon-and-large-trout/delete/{id}',
    method: ['GET', 'POST'],
    handler: deleteSalmonAndLargeTroutHandler.handler
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
