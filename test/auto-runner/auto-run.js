'use strict'

/**
 * This set of tests run the regression scripts in ./scripts using the
 * test runner
 */

const Lab = require('lab')
const lab = exports.lab = Lab.script()

const experiment = lab.experiment
const test = lab.test

const Runner = require('./runner')

experiment('Scripted regression tests', () => {
  test('Start page', async () => {
    await Runner.run(require('./scripts/startPage'))
  })
})
