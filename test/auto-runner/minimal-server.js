/**
 * Creates a minimal HAPI server for unit test injection
 */

const Nunjucks = require('nunjucks')
const Uuid = require('uuid')
const Glue = require('glue')
const { logger } = require('defra-logging-facade')
const Crypto = require('crypto')

require('dotenv').config()

const AuthorizationSchemes = require('../../src/lib/authorization-schemes')
const AuthorizationStrategies = require('../../src/lib/authorization-strategies')
const CacheDecorator = require('../../src/lib/cache-decorator')

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
    ],
    routes: { security: { noOpen: false } }
  },
  register: {
    plugins: [
      {
        plugin: require('hapi-auth-cookie')
      },
      {
        plugin: require('vision')
      },
      {
        plugin: require('h2o2')
      }
    ]
  }
}


module.exports = async () => {

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
          options.compileOptions.environment = Nunjucks.configure(options.path, {watch: false})
          return next()
        }
      }
    },
    path: [
      'src/views',
      'src/views/macros',
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/'
    ],
    context: () => {
      return {
        pgid: Uuid.v4(),
        fmt: process.env.CONTEXT === 'FMT'
      }
    }
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
      routes: process.env.CONTEXT === 'FMT' ? './src/routes/*.js' : './src/routes/angler.js'
    }
  })

  server.decorate('request', 'cache', CacheDecorator)

  // Initialize the server to get access to the cache
  await server.initialize()

  // Set a random cache key good for 30 years - shared between the nodes
  if (!await server.app.cache.get('hub-identity')) {
    await server.app.cache.set('hub-identity', Crypto.randomBytes(16), 1000 * 3600 * 24 * 365 * 30)
  }

  return server
}