'use strict'

const EntityApi = require('./entity-api')

/**
 * Species entity handler
 *
 */
module.exports = class SubmissionsApi extends EntityApi {
  constructor () {
    super('submissions')
  }

  async add (contactId, year) {
    return super.add({
      contactId: contactId,
      season: year
    })
  }

  async getByContactIdAndYear (contactId, year) {
    return super.searchFunction('getByContactIdAndSeason', `contact_id=${contactId}&season=${year}`)
  }
}
