'use strict'

/*
 * Decorators to make access to the session cache available as
 * simple setters and getters hiding the session key.
 */
const { logger } = require('defra-logging-facade')

module.exports = function () {
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
}
