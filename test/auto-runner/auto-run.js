'use strict'

/**
 * This set of tests run the regression scripts in ./scripts using the
 * test runner
 */
const { logger } = require('defra-logging-facade')
const SubmissionsApi = require('../../src/api/submissions')
const submissionsApi = new SubmissionsApi()

const Lab = require('lab')
const lab = exports.lab = Lab.script()

const experiment = lab.experiment
const test = lab.test
const Moment = require('moment')

const Runner = require('./runner')

const getContactFromLicenceKey = require('../../src/api/licence').getContactFromLicenceKey
const licence = require('./scripts/requests').LICENCE

experiment('Scripted regression tests', () => {
  lab.before(async () => {
    const contact = await getContactFromLicenceKey(licence)
    let submission = await submissionsApi.getByContactIdAndYear(contact.contact.id, Moment().year())
    if (submission) {
      logger.info(`Deleting submission: ${submission.id}`)
      submissionsApi.deleteById(submission.id)
    }
  })

  test('Start page', async () => {
    await Runner.run(require('./scripts/sign-in'))
  })

  test('Activity', async () => {
    await Runner.run(require('./scripts/activity'))
  })
})
