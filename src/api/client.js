'use strict'

/**
 * This module is responsible for the API rest interface and is data agnostic.
 */
const Url = require('url')
const Hoek = require('hoek')
const Request = require('request')
const ResponseError = require('../handlers/response-error')

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
      const uriObj = {
        protocol: 'http',
        hostname: process.env.API_HOSTNAME || 'localhost',
        port: Number.parseInt(process.env.API_PORT || 9580),
        pathname: path ? process.env.API_PATH + '/' + path : process.env.API_PATH
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
  makeRequest: (auth, uri, method, body, throwOnNotFound = false, assoc = false) => {
    return new Promise(function (resolve, reject) {
      Hoek.assert(internals.method[method], `Method not allowed: ${method}`)
      logger.debug(`API Call; ${method}:${uri} `)

      const requestObject = {
        uri: uri,
        method: method,
        timeout: Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS) || 60000,
        json: !assoc
      }

      if (auth) {
        requestObject.auth = {
          user: auth.username,
          pass: auth.password,
          sendImmediately: true
        }
      }

      if (body) {
        logger.debug(`Payload; ${JSON.stringify(body, null, 2)}`)
        requestObject.body = body
      }

      requestObject.headers = internals.headers(method, assoc)

      Request(requestObject, (err, response, body) => {
        if (err) {
          return reject(new Error(err))
        }

        // If not 2xx
        if (Math.floor(Number.parseInt(response.statusCode) / 100) !== 2) {
          /*
           * Not found is ok on searches - its the empty object and a legitimate response
           * but link GETS or id GETS should always return a result in HATEOAS
           */
          if (response.statusCode === ResponseError.status.NOT_FOUND) {
            if (throwOnNotFound) {
              reject(new ResponseError.Error(response.statusMessage, ResponseError.status.NOT_FOUND))
            } else {
              resolve()
            }
          } else {
            reject(new ResponseError.Error(response.statusMessage, response.statusCode))
          }
        }
        resolve(body)
      })
    })
  }
}

module.exports = {
  request: async (auth, method, path, search, body, throwOnNotFound = false) => {
    const request = internals.createRequest(path, search)
    return internals.makeRequest(auth, request, method, body, throwOnNotFound, false)
  },

  requestAssociationChange: async (auth, path, payload) => {
    const request = internals.createRequest(path)
    return internals.makeRequest(auth, request, internals.method.PUT, payload, true, true)
  },

  requestFromLink: async (auth, link) => {
    return internals.makeRequest(auth, link, internals.method.GET, null, true, false)
  },

  method: internals.method
}
