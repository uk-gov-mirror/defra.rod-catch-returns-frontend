'use strict'

const EntityApi = require('./entity-api')

/**
 * Rivers entity handler
 *
 */
module.exports = class SpeciesApi extends EntityApi {
  constructor () {
    super('rivers', async (request, e) => {
      return {
        id: EntityApi.keyFromLink(e),
        name: e.name,
        internal: e.internal
      }
    })
  }
}
