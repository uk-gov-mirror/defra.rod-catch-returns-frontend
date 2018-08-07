/**
 * The entry point of the rod catch returns web service. This is a hapi web server
 * and uses glue to compose the server.
 *
 */

require('dotenv').config()

const Glue = require('glue')
const Nunjucks = require('nunjucks')

const logger = require('node-js-logger')
const GoodWinston = require('good-winston')
const goodWinstonStream = new GoodWinston({ winston: logger })

logger.init({
  level: 'info',
  airbrakeKey: process.env.errbit_key,
  airbrakeHost: process.env.errbit_server,
  airbrakeLevel: 'error'
})

const manifest = {

  // Configure Hapi server and server-caching subsystem
  server: {
    port: process.env.PORT || 3000,
    cache: [
      {
        engine: require('catbox-redis'),
        host: process.env.REDIS_HOSTNAME,
        port: process.env.REDIS_PORT,
        partition: 'server-cache'
      }
    ]
  },

  // Register plugins
  register: {
    plugins: [
      /*
       * Plugin for logging
       * See https://www.npmjs.com/package/good
       */
      {
        plugin: require('good'),
        options: {
          reporters: {
            winston: [goodWinstonStream]
          }
        }
      },

      /*
       * Static file and directory handlers plugin for hapi.js
       * See https://www.npmjs.com/package/inert
       */
      {
        plugin: require('inert')
      },

      /*
       * Templates rendering plugin support for hapi.js
       * See https://www.npmjs.com/package/vision
       */
      {
        plugin: require('vision')
      },

      /*
       * Plug in for cookie based authentication
       * See https://www.npmjs.com/package/hapi-auth-cookie
       */
      {
        plugin: require('hapi-auth-cookie')
      },

      /*
       * Add a rudimentary health check
       * hit /health and check status 200
       * See: https://www.npmjs.com/package/hapi-alive
       */
      {
        plugin: require('hapi-alive'),
        options: {
          responses: {
            healthy: {
              message: 'Healthy'
            },
            unhealthy: {
              statusCode: 400
            }
          }
        }
      },

      /*
       * Plugin for serving up robots.txt
       * See https://www.npmjs.com/package/hapi-robots and
       * https://en.wikipedia.org/wiki/Robots_exclusion_standard
       */
      {
        plugin: require('hapi-robots'),
        options: {
          // will disallow everyone from every path:
          '*': ['/']
        }
      },

      /*
       * To print routes on startup change showStart to true
       * See https://www.npmjs.com/package/blipp
       */
      {
        plugin: require('blipp'),
        options: {
          showStart: false
        }
      },

      /*
       * Clean up any input
       * See: https://www.npmjs.com/package/disinfect
       */
      {
        plugin: require('disinfect'),
        options: {
          disinfectQuery: true,
          disinfectParams: true,
          disinfectPayload: true
        }
      },

      /*
       * Plugin for CSRF tokens
       * See https://www.npmjs.com/package/crumb
       */
      {
        plugin: require('crumb'),
        options: {
          key: 'rcr2018',
          cookieOptions: {
            isSecure: process.env.HTTPS === 'true' || false,
            isHttpOnly: true
          },
          logUnauthorized: true
        }
      }
    ]
  }
}

const options = {
  relativeTo: __dirname
}

;(async () => {
  try {
    const server = await Glue.compose(manifest, options)

    /*
     * Set up the nunjunks templating engine and include the new gov.uk
     * design system templates and components so that they are accessible
     * as macros in the templates
     */
    server.views({
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
      relativeTo: __dirname,
      path: [
        'src/views',
        'node_modules/govuk-frontend/',
        'node_modules/govuk-frontend/components/'
      ]
    })

    // Set up the route handlers for static resources
    server.route({
      method: 'GET',
      path: '/public/{param*}',
      config: {
        auth: false
      },
      handler: {
        directory: {
          path: 'public'
        }
      }
    })

    // Point the server plugin cache to an application cache to hold authenticated session data
    server.app.cache = server.cache({
      segment: 'sessions',
      expiresIn: process.env.SESSION_TTL_MS
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

    /*
     * Plugin to automatically load the routes based on their file location
     * See https://www.npmjs.com/package/hapi-router. Run last so the default authentication
     * strategy can be registered first
     */
    await server.register({
      plugin: require('hapi-router'),
      options: {
        routes: './src/routes/**/*.js' // uses glob to include files
      }
    })

    await server.start()

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      logger.info('Stopping server...')
      const err = await server.stop({ timeout: 10000 })
      logger.info('Stopped')
      process.exit((err) ? 1 : 0)
    })

    // Print the banner
    require('figlet')('Rod Catch Returns', function (err, data) {
      if (err) {
        return
      }
      console.log(data)
      logger.info(`Server started at ${server.info.uri}`)
    })
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
})()
