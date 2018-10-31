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

  async add (request, contactId, year) {
    return super.add(request, {
      contactId: contactId,
      season: year,
      status: 'INCOMPLETE',
      source: process.env.CONTEXT === 'ANGLER' ? 'WEB' : 'PAPER'
    })
  }

  async getByContactIdAndYear (request, contactId, year) {
    return super.searchFunction(request, 'getByContactIdAndSeason', `contact_id=${contactId}&season=${year}`)
  }

  async setSubmitted (request, submissionId) {
    return super.change(request, submissionId, { status: 'SUBMITTED' })
  }

  async setIncomplete (request, submissionId) {
    return super.change(request, submissionId, { status: 'INCOMPLETE' })
  }
}
