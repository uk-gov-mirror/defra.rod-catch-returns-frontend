'use strict'

/**
 * These routes are scanned automatically by the hapi-router
 */
const LoginHandler = require('../handlers/login')
const FailedLogin = require('../handlers/login-fail')
const LicenceHandler = require('../handlers/licence')
const ReportsHandler = require('../handlers/reports')
const ReportDownloadHandler = require('../handlers/report-download')

// Define the validators
const loginValidator = require('../validators/login')
const licenceValidator = require('../validators/licence')

// Define the handlers
const loginHandler = new LoginHandler('login', loginValidator)
const failedLogin = new FailedLogin('login', loginValidator)
const reportsHandler = new ReportsHandler('reports')
const reportDownloadHandler = new ReportDownloadHandler()
const licenceHandler = new LicenceHandler('licence', licenceValidator)

const api = {
  host: process.env.API_HOSTNAME || 'localhost',
  port: Number.parseInt(process.env.API_PORT || 9580),
  protocol: 'http'
}

/*
 * The following set of handlers are the additional set of handlers
 * required by the FMT interface
 */
module.exports = [

  // Login GET handler
  {
    path: '/login',
    method: 'GET',
    handler: loginHandler.handler,
    options: { auth: false }
  },

  // Login POST handler
  {
    path: '/login',
    method: 'POST',
    handler: loginHandler.handler,
    options: { auth: { strategies: ['active-dir-strategy', 'session'] } }
  },

  // Failed Login GET handler
  {
    path: '/login-fail',
    method: 'GET',
    handler: failedLogin.handler,
    options: { auth: false }
  },

  // Failed Login POST handler
  {
    path: '/login-fail',
    method: 'POST',
    handler: failedLogin.handler,
    options: { auth: { strategies: ['active-dir-strategy', 'session'] } }
  },

  /*
   * The remaining set of handlers are secured by the default authorization strategy -
   * using hapi-auth-cookie
   */
  // Licence not found GET handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandler.handler
  },

  // Reports handler
  {
    path: '/reports',
    method: 'GET',
    handler: reportsHandler.handler
  },

  // Report download handler
  {
    path: '/reports/{file}',
    method: 'GET',
    handler: reportDownloadHandler.handler
  },

  // Back to the catch return from the reports
  {
    path: '/reports-back',
    method: 'GET',
    handler: async (request, h) => {
      return h.redirect(((cache) => {
        if (cache.back) {
          return cache.back
        } else if (cache.contactId) {
          return '/summary'
        } else {
          return '/licence'
        }
      })(await request.cache().get()))
    }
  },

  // End session handler
  {
    path: '/logout',
    method: 'GET',
    handler: async (request, h) => {
      await request.cache().drop()
      request.cookieAuth.clear()
      return h.redirect('/')
    }
  },

  {
    method: ['GET', 'POST'],
    path: '/reporting/{reports*}',
    options: { auth: false },
    handler: {
      proxy: {
        mapUri: (request) => {
          return {
            uri: `http://${api.host}:${api.port}/api/reporting/${request.params.reports}`
          }
        },
        passThrough: true,
        xforward: true
      }
    }
  }
]
