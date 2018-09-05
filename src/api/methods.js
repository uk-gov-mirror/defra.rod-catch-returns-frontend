'use strict'

const EntityApi = require('./entity-api')

/**
 * Methods entity handler
 *
 */
module.exports = class MethodsApi extends EntityApi {
  constructor () {
    super('methods')
  }
}
