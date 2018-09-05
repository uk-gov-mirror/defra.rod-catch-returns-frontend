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
  createRequest: (path, query) => {
    try {
      Hoek.assert(path, 'A path must be supplied')

      const uriObj = {
        protocol: 'http',
        hostname: process.env.API_HOSTNAME || 'localhost',
        port: Number.parseInt(process.env.API_PORT || 9580),
        pathname: process.env.API_PATH + '/' + path
      }

      if (query) {
        uriObj.query = query
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
  makeRequest: async (uri, method, body) => {
    Hoek.assert(internals.method[method], `Method not allowed: ${method}`)

    logger.debug(`API Call; ${method}:${uri} `)

    const result = await Request({
      uri: uri,
      method: method,
      json: true,
      timeout: Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS) || 10000,
      headers: {
        'Accept': 'application/json'
      },
      body: body
    })

    return result
  }
}

module.exports = {
  request: async (method, path, query, body) => {
    return internals.makeRequest(internals.createRequest(path, query), method, body)
  },

  method: internals.method
}
