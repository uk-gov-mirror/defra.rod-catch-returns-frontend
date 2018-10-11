'use strict'

/**
 * These routes are scanned automatically by the hapi-router
 */
const LicenceHandler = require('../handlers/licence')
const LicenceNotFoundHandler = require('../handlers/licence-not-found')
const LoginHandler = require('../handlers/login')
const FailedLogin = require('../handlers/login-fail')
const DidYouFishHandler = require('../handlers/did-you-fish')
const YearHandler = require('../handlers/year')
const SummaryHandler = require('../handlers/summary')
const ActivityHandler = require('../handlers/activities')
const DeleteActivityHandler = require('../handlers/delete-activity')
const SalmonAndLargeTroutHandler = require('../handlers/salmon-and-large-trout')
const DeleteSalmonAndLargeTroutHandler = require('../handlers/delete-salmon-and-large-trout')
const SmallCatchHandler = require('../handlers/small-catches')
const DeleteSmallCatchHandler = require('../handlers/delete-small-catch')
const ConfirmationHandler = require('../handlers/confirmation')
const ReviewHandler = require('../handlers/review')
const SaveHandler = require('../handlers/save')

// Define the validators
const loginValidator = require('../validators/login')
const yearValidator = require('../validators/year')
const didYouFishValidator = require('../validators/did-you-fish')
const activityValidator = require('../validators/activity')
const salmonAndLargeTroutValidator = require('../validators/salmon-and-large-trout')
const smallCatchValidator = require('../validators/small-catch')

// Define the handlers
const licenceHandler = new LicenceHandler('licence', loginValidator)
const licenceNotFound = new LicenceNotFoundHandler('licence', loginValidator)
const loginHandler = new LoginHandler('login', loginValidator)
const failedLogin = new FailedLogin('login', loginValidator)
const yearHandler = new YearHandler('select-year', yearValidator)
const didYouFishHandler = new DidYouFishHandler('did-you-fish', didYouFishValidator)
const summaryHandler = new SummaryHandler('summary')
const activityHandler = new ActivityHandler('activity', activityValidator)
const deleteActivityHandler = new DeleteActivityHandler('delete-activity', activityValidator)
const salmonAndLargeTroutHandler = new SalmonAndLargeTroutHandler('salmon-and-large-trout', salmonAndLargeTroutValidator)
const deleteSalmonAndLargeTroutHandler = new DeleteSalmonAndLargeTroutHandler('delete-salmon-and-large-trout')
const smallCatchHandler = new SmallCatchHandler('small-catches', smallCatchValidator)
const deleteSmallCatchHandler = new DeleteSmallCatchHandler('delete-small-catch')
const reviewHandler = new ReviewHandler('review')
const confirmationHandler = new ConfirmationHandler('confirmation')
const saveHandler = new SaveHandler('save')

module.exports = [

  // Redirect to the start page
  {
    path: '/',
    method: 'GET',
    options: { auth: false },
    handler: (request, h) => {
      return process.env.CONTEXT === 'ANGLER' ? h.redirect('/licence') : h.redirect('/login')
    }
  },

  // Login handler
  {
    path: '/login',
    method: ['GET', 'POST'],
    handler: loginHandler.handler,
    options: { auth: 'active-dir-strategy' }
  },

  // Failed Login login
  {
    path: '/login-fail',
    method: ['GET', 'POST'],
    handler: failedLogin.handler,
    options: { auth: 'active-dir-strategy' }
  },

  // Licence handler
  {
    path: '/licence',
    method: 'GET',
    handler: licenceHandler.handler
  },

  // Licence not found handler
  {
    path: '/licence-not-found',
    method: 'GET',
    handler: licenceNotFound.handler
  },

  // Licence handler
  {
    path: '/licence',
    method: 'POST',
    handler: licenceHandler.handler,
    options: { auth: 'licence-strategy' }
  },

  // Licence not found handler
  {
    path: '/licence-not-found',
    method: 'POST',
    handler: licenceNotFound.handler,
    options: { auth: 'licence-strategy' }
  },

  // Year handler
  {
    path: '/select-year',
    method: ['GET', 'POST'],
    handler: yearHandler.handler
  },

  // Did you fish
  {
    path: '/did-you-fish',
    method: ['GET', 'POST'],
    handler: didYouFishHandler.handler
  },

  // Summary handler
  {
    path: '/summary',
    method: ['GET', 'POST'],
    handler: summaryHandler.handler
  },

  // Activity handler
  {
    path: '/activities/{id}',
    method: ['GET', 'POST'],
    handler: activityHandler.handler
  },

  // Delete activity handler
  {
    path: '/delete/activities/{id}',
    method: ['GET', 'POST'],
    handler: deleteActivityHandler.handler
  },

  // Add/edit salmon and large sea trout handler
  {
    path: '/catches/{id}',
    method: ['GET', 'POST'],
    handler: salmonAndLargeTroutHandler.handler
  },

  // Delete salmon and sea trout handler
  {
    path: '/delete/catches/{id}',
    method: ['GET', 'POST'],
    handler: deleteSalmonAndLargeTroutHandler.handler
  },

  // Add/edit the small catch handler
  {
    path: '/small-catches/{id}',
    method: ['GET', 'POST'],
    handler: smallCatchHandler.handler
  },

  // Delete the small catch handler
  {
    path: '/delete/small-catches/{id}',
    method: ['GET', 'POST'],
    handler: deleteSmallCatchHandler.handler
  },

  // Submission handler
  {
    path: '/review',
    method: ['GET', 'POST'],
    handler: reviewHandler.handler
  },

  // Confirmation handler
  {
    path: '/save',
    method: 'GET',
    handler: saveHandler.handler
  },

  // Confirmation handler
  {
    path: '/confirmation',
    method: 'GET',
    handler: confirmationHandler.handler
  },

  // Error 500 handler
  {
    path: '/error500',
    method: 'GET',
    options: { auth: false },
    handler: (request, h) => {
      return h.view('error500')
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
