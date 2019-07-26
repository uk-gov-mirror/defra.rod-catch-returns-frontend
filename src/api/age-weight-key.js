'use strict'

const Client = require('./client')

/**
 * Age weight key entity handler
 */
module.exports = class AgeWeightKeyApi {
  static async getByYear (request, year) {
    return Client.request(null, Client.method.GET, `reporting/reference/grilse-probabilities/${year}`)
  }

  static async postNew (request, year, filePath, overwrite) {
    return Client.requestFileUpload(null, `reporting/reference/grilse-probabilities/${year}`,
      `overwrite=${overwrite ? 'true' : 'false'}`, filePath)
  }
}
