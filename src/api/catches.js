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

  async add (submissionId, riverId, dateCaught, speciesId, mass, methodId, released) {
    return super.add({
      submission: submissionId,
      river: riverId,
      date_caught: dateCaught,
      species: speciesId,
      mass: mass,
      method: methodId,
      released: released
    })
  }
}
/*
 * {
 * "dateCaught": "2018-09-07T08:41:11.433Z",
 * "mass": {
 * "kg": 0,
 * "oz": 0,
 * "type": "Metric"
 * },
 * "method": {
 * "name": "string"
 * },
 * "released": true,
 * "river": {
 * "name": "string"
 * },
 * "species": {
 * "name": "string"
 * },
 * "submission":
 * }
 */
