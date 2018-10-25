'use strict'

/**
 * This file contains the handlers for the authorization strategies used by hapi
 */

const Joi = require('joi')
const Client = require('../api/client')

// Joi schema to validate a licence payload
const licenceSchema = Joi.object().keys({
  licence: Joi.string().alphanum().min(6).max(6).required(),
  postcode: Joi.string().regex(/^[a-zA-Z0-9\s]{6,9}$/).required()
})

// Joi schema to validate an active directory login payload
const activeDirectorySchema = Joi.object().keys({
  user: Joi.string().email({ minDomainAtoms: 2 }).required(),
  password: Joi.string().required()
})

module.exports = {
  activeDirScheme: () => {
    return {
      options: {
        payload: true
      },

      payload: async (request, h) => {
        const result = Joi.validate(request.payload, activeDirectorySchema,
          { allowUnknown: true, abortEarly: true })

        // If cannot validate the schema is not authorized
        if (result.error) {
          return h.continue
        }

        const auth = {
          username: request.payload.user.trim(),
          password: request.payload.password.trim()
        }

        try {
          await Client.request(auth, Client.method.GET)
          request.app = {
            authorization: auth
          }
          return h.continue
        } catch (err) {
          if (err.statusCode === 401 || err.statusCode === 403) {
            return h.continue
          } else {
            return h.redirect('/error500').takeover()
          }
        }
      },

      /**
       * Hapi does not support authentication based on the payload as the authentication
       * system expected authentication system in the hearer and this is problematic where no javascript
       * is permitted. So here the authentication is passed on to the payload function which is intended
       * for schema validation
       * @param request
       * @param h
       * @returns {Promise<*>}
       */
      authenticate: async (request, h) => {
        return h.authenticated({ credentials: {} })
      }
    }
  },

  licenceScheme: () => {
    return {

      options: {
        payload: true
      },

      payload: async (request, h) => {
        const result = Joi.validate(request.payload, licenceSchema,
          { allowUnknown: true, abortEarly: true })

        // If cannot validate the schema is not authorized
        if (result.error) {
          return h.continue
        }

        const auth = {
          username: request.payload.licence.toUpperCase().trim(),
          password: request.payload.postcode.toUpperCase().replace(' ', '')
        }

        try {
          await Client.request(auth, Client.method.GET, null, null, null)
          request.app = {
            authorization: auth
          }
          return h.continue
        } catch (err) {
          if (err.statusCode === 401 || err.statusCode === 403) {
            return h.continue
          } else {
            return h.redirect('/error500').takeover()
          }
        }
      },

      authenticate: async (request, h) => {
        return h.authenticated({ credentials: {} })
      }
    }
  }
}
