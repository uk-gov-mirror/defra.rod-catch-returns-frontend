const Glue = require('glue')
const logger = require('node-js-logger')
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

    const server = await Glue.compose(manifest, {})

    // Set up default authentication strategy using cookies
    server.auth.strategy('session', 'cookie', {
      password: process.env.COOKIE_PW,
      cookie: 'sid',
      redirectTo: '/licence',
      isSecure: false
    })

    server.auth.default('session')

    await server.register({
      plugin: require('hapi-router'),
      options: {
        routes: './src/routes/**/*.js' // uses glob to include files
      }
    })

    logger.debug(`Request: request (${internals.counter}) ${JSON.stringify(request, null, 4)}`)

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
