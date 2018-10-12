'use strict '

/**
 * Used to encrypt and decrypt the authorization details in the redis cache.
 * Uses AES-256 https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
 *
 */
const crypto = require('crypto')
const algorithm = 'aes128'

const keyBuffer = Buffer.from(process.env.AUTH_PW)
const iv = crypto.randomBytes(16)

class CryptoError extends Error {
  constructor (message) {
    super(message)
    this.name = 'Crypto error'
  }
}

const internals = {
  encrypt: (text) => {
    try {
      const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv)
      let result = cipher.update(text, 'utf8', 'base64')
      result += cipher.final('base64')
      return result
    } catch (err) {
      throw new CryptoError('Encryption error')
    }
  },

  decrypt: (text) => {
    try {
      const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv)
      let result = decipher.update(text, 'base64')
      result += decipher.final()
      return result
    } catch (err) {
      throw new CryptoError('Decryption error')
    }
  }
}

module.exports = {
  writeObj: (obj) => {
    return internals.encrypt(JSON.stringify(obj))
  },

  readObj: (str) => {
    try {
      return JSON.parse(internals.decrypt(str))
    } catch (err) {
      throw new CryptoError('Deserialization error')
    }
  },

  cryptoError: CryptoError
}
