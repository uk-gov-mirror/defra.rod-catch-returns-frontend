'use strict'

/**
 * These routes are scanned automatically by the hapi-router
 */
const LoginHandler = require('../handlers/login')
const FailedLogin = require('../handlers/login-fail')
const LicenceHandler = require('../handlers/licence')
const ReportsHandler = require('../handlers/reports')

// Define the validators
const loginValidator = require('../validators/login')
const licenceValidator = require('../validators/licence')

// Define the handlers
const loginHandler = new LoginHandler('login', loginValidator)
const failedLogin = new FailedLogin('login', loginValidator)
const reportsHandler = new ReportsHandler('reports')
const licenceHandler = new LicenceHandler('licence', licenceValidator)

const api = {
  host: process.env.API_HOSTNAME || 'localhost',
  port: Number.parseInt(process.env.API_PORT || 9580),
  protocol: 'http'
}

module.exports = [

  /*
   * The following set of handlers are the additional set of handlers
   * required by teh FMT interface
   */

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
    method: 'GET',
    path: '/reporting/catches/{season}',
    handler: {
      proxy: {
        uri: `http://${api.host}:${api.port}/api/reporting/catches/{season}`,
        passThrough: true,
        xforward: true
      }
    }
  }
]
