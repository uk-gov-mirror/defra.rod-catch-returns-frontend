'use strict'

const EntityApi = require('./entity-api')

/**
 * Species entity handler
 *
 */
module.exports = class SpeciesApi extends EntityApi {
  constructor () {
    super('species')
  }
}
