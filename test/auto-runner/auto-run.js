'use strict'

/**
 * This set of tests run the regression scripts in ./scripts using the
 * test runner
 */
const { logger } = require('defra-logging-facade')
const Lab = require('lab')
const lab = exports.lab = Lab.script()

const experiment = lab.experiment
const test = lab.test
const Moment = require('moment')

const Runner = require('./runner')

const Client = require('../../src/api/client')
const licence = require('./scripts/requests').LICENCE
const postcode = require('./scripts/requests').POSTCODE
require('dotenv').config()

experiment('Scripted regression tests', () => {
  lab.before(async () => {
    const auth = { username: licence, password: postcode }
    const contact = await Client.request(auth, Client.method.GET, `licence/${licence}`)

    if (!contact) {
      logger.error('Ensure the API is started in mock-mode and can find a contact for the licence: ' + licence)
      process.exit(-1)
    }

    let submission = await Client.request(auth, Client.method.GET, this.path + `/search/getByContactIdAndSeason`, `contact_id=${contact.contact.id}&season=${Moment().year()}`)
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

  test('Large catch', async () => {
    await Runner.run(require('./scripts/large-catch'))
  })

  test('Review and submit', async () => {
    await Runner.run(require('./scripts/review-and-submit'))
  })
})
