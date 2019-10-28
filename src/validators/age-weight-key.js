'use strict'

const { logger } = require('defra-logging-facade')
const moment = require('moment')

const AgeWeightKeyApi = require('../api/age-weight-key')
const ResponseError = require('../handlers/response-error')
const Path = require('path')

const MAX_FILE_UPLOAD_BYTES = process.env.MAX_FILE_UPLOAD_BYTES || 100 * 1000 // 100Kb

/**
 * Validate the did you fish input
 */
module.exports = async (request) => {
  const errors = []

  const now = moment()
  const years = [-2, -1, 0, 1, 2].map(y => (now.year() + y).toString())

  if (!request.payload.gate) {
    errors.push({ type: 'NO_GATE_SELECTED' })
  }

  if (!request.payload.year) {
    errors.push({ type: 'NO_YEAR_ENTERED' })
  } else if (!parseInt(request.payload.year)) {
    errors.push({ type: 'NOT_A_REAL_YEAR' })
  } else if (!years.includes(request.payload.year)) {
    errors.push({ type: 'YEAR_OUT_OF_RANGE' })
  }

  if (!request.payload.upload || !request.payload.upload.filename) {
    errors.push({ type: 'NO_FILE_SELECTED' })
  } else {
    if (Path.extname(request.payload.upload.filename.toString().toUpperCase()) !== '.CSV') {
      errors.push({ type: 'BAD_FILE_TYPE' })
    } else {
      if (request.payload.upload.bytes > MAX_FILE_UPLOAD_BYTES) {
        errors.push({ type: 'FILE_TOO_LARGE' })
      } else if (request.payload.upload.bytes === 0) {
        errors.push({ type: 'FILE_EMPTY' })
      }
    }
  }

  /**
   * Upload the file and then retrieve tha API errors
   */
  if (!errors.length) {
    const tempFilePath = request.payload.upload.path
    logger.debug(`Uploaded age weight key file: ${tempFilePath}`)

    const response = await AgeWeightKeyApi.postNew(request, request.payload.year,
      request.payload.gate, tempFilePath, !!request.payload.overwrite)

    if (response.statusCode === ResponseError.status.CONFLICT) {
      return [{ type: 'OVERWRITE_DISALLOWED' }]
    }

    if (response.status === ResponseError.status.BAD_REQUEST && response.errors) {
      return [{ type: 'BAD_FILE' }].concat(response.errors)
    }
  }

  return errors.length ? errors : null
}
