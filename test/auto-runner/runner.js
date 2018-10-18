'use strict'

const Nunjucks = require('nunjucks')
const Glue = require('glue')
const { logger } = require('defra-logging-facade')
const Code = require('code')
const expect = Code.expect
const Crypto = require('crypto')

require('dotenv').config()

const AuthorizationSchemes = require('../../src/lib/authorization-schemes')
const AuthorizationStrategies = require('../../src/lib/authorization-strategies')
const CacheDecorator = require('./src/lib/cache-decorator')

// Minimal hapi configuration for tests
const manifest = {
  server: {
    cache: [
      {
        engine: require('catbox-redis'),
        host: process.env.REDIS_HOSTNAME,
        port: process.env.REDIS_PORT,
        partition: 'session-cache'
      }
    ]
  },
  register: {
    plugins: [
      {
        plugin: require('hapi-auth-cookie')
      },
      {
        plugin: require('vision')
      }
    ]
  }
}

const internals = {
  toInjectionObject: (request) => {
    const { path, method, payload } = request
    const result = {}

    result.method = method
    result.url = path

    if (payload && method === 'POST') {
      result.payload = payload
    }

    if (internals.sid) {
      result.headers = { cookie: 'sid=' + internals.sid }
    }

    return result
  },

  run: async (request) => {
    const { status, redirect } = request
    internals.counter++

    // Set up a minimal server to run the tests
    const server = await Glue.compose(manifest, {})

    // Point the server plugin cache to an application cache to hold authenticated session data
    server.app.cache = server.cache({
      segment: 'sessions',
      expiresIn: process.env.SESSION_TTL_MS || 20000
    })

    server.views({
      relativeTo: require('../../defaults').ROOT_PATH,
      engines: {
        html: {
          compile: function (src, options) {
            const template = Nunjucks.compile(src, options.environment)
            return function (context) {
              return template.render(context)
            }
          },
          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false })
            return next()
          }
        }
      },
      path: [
        'src/views',
        'node_modules/govuk-frontend/',
        'node_modules/govuk-frontend/components/'
      ]
    })

    server.auth.scheme('active-dir-scheme', AuthorizationSchemes.activeDirScheme)
    server.auth.scheme('licence-scheme', AuthorizationSchemes.licenceScheme)
    server.auth.strategy('active-dir-strategy', 'active-dir-scheme')
    server.auth.strategy('licence-strategy', 'licence-scheme')
    server.auth.strategy('session', 'cookie', AuthorizationStrategies.sessionCookie)
    server.auth.default('session')

    await server.register({
      plugin: require('hapi-router'),
      options: {
        routes: './src/routes/**/*.js' // uses glob to include files
      }
    })

    server.decorate('request', 'cache', CacheDecorator)

    logger.debug(`Request: request (${internals.counter}) ${JSON.stringify(request, null, 4)}`)

    // Initialize the server to get access to the cache
    await server.initialize()

    // Set a random cache key good for 30 years - shared between the nodes
    if (!await server.app.cache.get('hub-identity')) {
      await server.app.cache.set('hub-identity', Crypto.randomBytes(16), 1000 * 3600 * 24 * 365 * 30)
    }

    const response = await server.inject(internals.toInjectionObject(request))
    internals.sid = internals.getCookies(response)['sid'] || internals.sid

    let err = false
    if (response.statusCode !== status) {
      err = true
    }

    if (redirect) {
      if (response.headers.location !== redirect) {
        err = true
      }
    } else {
      if (response.headers.location) {
        err = true
      }
    }

    if (err) {
      logger.error(`Error: request (${internals.counter}) ${JSON.stringify(request, null, 4)}`)
      logger.error('Got status: ' + response.statusCode)
      if (response.headers.location) {
        logger.error('Got redirect: ' + response.headers.location)
      }
    }

    expect(response.statusCode).to.equal(status)
    if (redirect) {
      expect(response.headers.location).to.equal(redirect)
    } else {
      expect(response.headers.location).to.be.undefined()
    }
  },

  getCookies: (response) => {
    const cookies = {}
    response.headers['set-cookie'] && response.headers['set-cookie'].forEach((cookie) => {
      const parts = (cookie.split(';')[0]).match(/(.*?)=(.*)$/)
      cookies[parts[1].trim()] = (parts[2] || '').trim()
    })
    return cookies
  }

}

module.exports = {
  run: async (requests) => {
    internals.counter = 0
    delete internals.sid
    for (const request of requests) {
      await internals.run(request)
    }
  }
}
