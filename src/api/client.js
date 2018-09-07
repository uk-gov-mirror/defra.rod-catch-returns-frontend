'use strict'

/**
 * This module is responsible for the API rest interface and is data agnostic.
 */
const Url = require('url')
const Hoek = require('hoek')
const Request = require('request-promise')
const { logger } = require('defra-logging-facade')

const internals = {
  method: {
    GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE'
  },

  /**
   * Generate the URI for the request
   * @param path
   * @param query
   * @param body
   * @return {string}
   */
  createRequest: (path, search) => {
    try {
      Hoek.assert(path, 'A path must be supplied')

      const uriObj = {
        protocol: 'http',
        hostname: process.env.API_HOSTNAME || 'localhost',
        port: Number.parseInt(process.env.API_PORT || 9580),
        pathname: process.env.API_PATH + '/' + path
      }

      if (search) {
        uriObj.search = search
      }

      return Url.format(uriObj)
    } catch (err) {
      logger.error(err)
      throw err
    }
  },

  /**
   * Make a request to a given uri
   * @param uri
   * @param method - Either 'GET' or 'POST'
   * @return {Promise.<void>} - The (json parsed) results or the request
   */
  makeRequest: async (uri, method, body, throwOnNotFound = false) => {
    // The request library throws an exception on an error status response
    try {
      Hoek.assert(internals.method[method], `Method not allowed: ${method}`)
      logger.debug(`API Call; ${method}:${uri} `)

      return await Request({
        uri: uri,
        method: method,
        json: true,
        timeout: Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS) || 10000,
        body: body
      })
    } catch (err) {
      /*
       * Not found is ok on searches - its the empty object and a legitimate response
       * but links should always return a result in HATEOAS
       */
      if (err.statusCode === 404) {
        if (throwOnNotFound) {
          throw err
        }
      } else {
        throw err
      }
    }
  }
}

module.exports = {
  request: async (method, path, search, body, throwOnNotFound = false) => {
    const request = internals.createRequest(path, search)
    return internals.makeRequest(request, method, body, throwOnNotFound)
  },

  requestFromLink: async (link) => {
    return internals.makeRequest(link, internals.method.GET, null, true)
  },

  method: internals.method
}
