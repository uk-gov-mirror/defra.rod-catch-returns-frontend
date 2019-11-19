'use strict'

const Fs = require('fs')
const TEMP = require('../../defaults').TEMP
const { logger } = require('defra-logging-facade')

module.exports = {
  /**
   * Create the temporary directory if it does not exist
   */
  checkTempDir: async () => {
    return new Promise((resolve, reject) => {
      Fs.mkdir(TEMP, { mode: 0o777 }, (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
            logger.info(`Using temporary file directory: ${TEMP}`)
            resolve()
          } else {
            logger.error(err)
            reject(err)
          }
        } else {
          logger.info(`Created temporary file directory: ${TEMP}`)
          resolve()
        }
      })
    })
  }
}
