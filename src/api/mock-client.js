'use strict'

const riverList = require('../../test/test-responses/rivers-list')
const speciesList = require('../../test/test-responses/species-list')
const methodsList = require('../../test/test-responses/methods-list')

/**
 * This is a mock client stub for unit tests.
 */
const internals = {
  method: {
    GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE'
  }
}

module.exports = {
  request: async (method, path, query, body) => {
    if (method === internals.method.GET) {
      if (path === 'rivers' && !query) {
        return riverList
      }

      if (path === 'species' && !query) {
        return speciesList
      }

      if (path === 'methods' && !query) {
        return methodsList
      }

    }
  },

  method: internals.method
}
