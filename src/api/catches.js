'use strict'

const EntityApi = require('./entity-api')

/**
 * Catches entity handler
 *
 */
module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('catches')
  }
}
