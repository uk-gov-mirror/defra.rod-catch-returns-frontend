'use strict'

/**
 * System logger resources
 * @type {*|yaml}
 */
const Winston = require('winston')
const goodWinston = require('hapi-good-winston').goodWinston

const winlogger = Winston.createLogger({
  level: 'info',
  colorize: true,
  timestamp: true,
  format: Winston.format.simple(),
  showLevel: true,
  transports: [
    new (Winston.transports.Console)()
  ]
})

const goodWinstonOptions = {
  levels: {
    response: 'info',
    error: 'info'
  }
}

module.exports = {
  /**
   * Return the system logger
   */
  logger: winlogger,

  /**
   * Return the winston-good interface for Hapi
   */
  goodWinstonStream: () => {
    return [ goodWinston(winlogger, goodWinstonOptions) ]
  }
}
