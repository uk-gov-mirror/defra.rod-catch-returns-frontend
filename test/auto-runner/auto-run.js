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

const LICENCE = require('./scripts/requests').LICENCE
const Runner = require('./runner')

const getContactFromLicenceKey = require('../../src/api/licence').getContactFromLicenceKey
const licence = require('./scripts/requests').LICENCE

experiment('Scripted regression tests', () => {
  lab.before(async () => {
    const contact = await getContactFromLicenceKey(licence)
    if (!contact) {
      logger.error('Ensure the API is started in mock-mode and can find a contact for the licence: ' + LICENCE)
      process.exit(-1)
    }
    let submission = await submissionsApi.getByContactIdAndYear(contact.contact.id, Moment().year())
    if (submission) {
      logger.error('Tests require API to be restarted in in-memory mode for each test run')
      process.exit(-1)
    }
  })

  test('Sign in page', async () => {
    await Runner.run(require('./scripts/sign-in').first)
  })

  test('Activity', async () => {
    await Runner.run(require('./scripts/activity'))
  })

  test('Small catch', async () => {
    await Runner.run(require('./scripts/small-catch'))
  })
  //
  // test('Large catch', async () => {
  //   await Runner.run(require('./scripts/large-catch'))
  // })
  //
  // test('Review and submit', async () => {
  //   await Runner.run(require('./scripts/review-and-submit'))
  // })
})
