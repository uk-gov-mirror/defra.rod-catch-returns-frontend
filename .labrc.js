module.exports = {
  coverage: true,
  lint: true,
  timeout: 30000,
  threshold: 85,
  leaks: false, // isomorphic-fetch, used by airbrake-js creates global variables.
  // lcov reporter required for travisci/codeclimate
  reporter: ['console', 'html', 'lcov'],
  output: ['stdout', 'coverage/coverage.html', 'coverage/lcov.info']
}
