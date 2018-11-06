module.exports = {
  coverage: true,
  lint: true,
  timeout: 30000,
  threshold: 85,
  leaks: false, // node-fetch creates global variables. A CR has been raised.
  // lcov reporter required for travisci/codeclimate
  reporter: ['console', 'html', 'lcov'],
  output: ['stdout', 'coverage/coverage.html', 'coverage/lcov.info']
}
