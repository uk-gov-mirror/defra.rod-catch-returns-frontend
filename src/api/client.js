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
    GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', PATCH: 'PATCH'
  },

  /**
   * Function to determine which headers should be set
   * @param method
   * @param assoc
   */
  headers: (method, assoc) => {
    const headers = {}
    if (assoc) {
      headers['Content-Type'] = 'text/uri-list'
    } else {
      headers['Content-Type'] = 'application/json'
    }
    return headers
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
   * Bottom level request method
   * @param uri - the request path
   * @param method - internals.method
   * @param body - (JSON formatted request payload)
   * @param throwOnNotFound - if throw throws exception on 404
   * @param assoc - if true will operate on associations (using the text/uri-list header)
   * @returns {Promise<void>}
   */
  makeRequest: async (uri, method, body, throwOnNotFound = false, assoc = false) => {
    // The request library throws an exception on an error status response
    try {
      Hoek.assert(internals.method[method], `Method not allowed: ${method}`)
      logger.debug(`API Call; ${method}:${uri} `)

      const requestObject = {
        uri: uri,
        method: method,
        timeout: Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS) || 10000,
        json: !assoc
      }

      if (body) {
        logger.debug(`Payload; ${JSON.stringify(body, null, 2)}`)
        requestObject.body = body
      }

      requestObject.headers = internals.headers(method, assoc)
      return await Request(requestObject)
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

  requestAssociationChange: async (path, payload) => {
    const request = internals.createRequest(path)
    return internals.makeRequest(request, internals.method.PUT, payload, true, true)
  },

  requestFromLink: async (link) => {
    return internals.makeRequest(link, internals.method.GET, null, true)
  },

  method: internals.method
}
