'use strict'

const Nunjucks = require('nunjucks')
const Glue = require('glue')
const { logger } = require('defra-logging-facade')
const Code = require('code')
const expect = Code.expect
require('dotenv').config()

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
    const {status, redirect} = request
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

    // Set up default authentication strategy using cookies
    server.auth.strategy('session', 'cookie', {
      password: process.env.COOKIE_PW,
      cookie: 'sid',
      redirectTo: '/licence',
      isSecure: process.env.HTTPS === 'true' || false,
      clearInvalid: true,
      /**
       * validation function called on every request
       * When the cache-entry expires the user has to re-authenticate
       */
      validateFunc: async (request, session) => {
        const server = request.server
        const cached = await server.app.cache.get(session.sid)

        const out = {
          valid: !!cached
        }

        if (out.valid) {
          out.credentials = cached.user
        }

        return out
      }
    })

    server.auth.default('session')

    await server.register({
      plugin: require('hapi-router'),
      options: {
        routes: './src/routes/**/*.js' // uses glob to include files
      }
    })

    /*
     * Decorator to retrieve make access to the session cache available as.
     * simple setters and getters hiding the session key
     */
    server.decorate('request', 'cache', function () {
      return {
        get: async () => {
          try {
            const result = await this.server.app.cache.get(this.auth.artifacts.sid)
            logger.debug(`cache read: ${this.auth.artifacts.sid}: ${JSON.stringify(result)}`)
            return result
          } catch (err) {
            throw new Error('Cache fetch error')
          }
        },
        set: async (obj) => {
          try {
            logger.debug(`cache write: ${this.auth.artifacts.sid}: ${JSON.stringify(obj)}`)
            await this.server.app.cache.set(this.auth.artifacts.sid, obj)
          } catch (err) {
            throw new Error('Cache put error')
          }
        },
        drop: async () => {
          try {
            await this.server.app.cache.drop(this.auth.artifacts.sid)
            logger.debug(`cache drop: ${this.auth.artifacts.sid}`)
          } catch (err) {
            throw new Error('Cache drop error')
          }
        }
      }
    })

    logger.debug(`Request: request (${internals.counter}) ${JSON.stringify(request, null, 4)}`)

    // Initialize the server to get access to the cache
    await server.initialize()
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
