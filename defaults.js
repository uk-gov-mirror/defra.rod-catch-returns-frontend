'use strict'

const Path = require('path')

// Little module to capture the root path
module.exports = {
  ROOT_PATH: __dirname,
  TEMP: process.env.TEMP_DIR || Path.join(__dirname, 'temp')
}
