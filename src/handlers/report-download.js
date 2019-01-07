'use strict'

/**
 * Handle the request to download a file
 */
const BaseHandler = require('./base')
const aws = require('../lib/aws')

module.exports = class ReportsHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for reports
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    const stream = await aws.getReport(process.env.REPORTS_S3_LOCATION_FOLDER + '/' + request.params.file)
    return h.response(stream.Body)
      .header('Content-type', stream.ContentType)
      .header('Content-length', stream.ContentLength)
      .header('content-disposition', `attachment; filename=${request.params.file}`)
      .header('ETag', stream.ETag)
      .header('Last-Modified', stream.LastModified)
  }
}
