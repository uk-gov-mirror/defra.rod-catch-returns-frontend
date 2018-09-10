'use strict'

/**
 * General functions
 */
module.exports = {
  printWeight: (c) => {
    if (c.mass.type === 'IMPERIAL') {
      return Math.floor(c.mass.oz / 16).toString() + 'lbs ' + Math.round(c.mass.oz % 16).toString() + 'oz'
    } else {
      return (Math.round(c.mass.kg * 10) / 10).toString() + 'Kg'
    }
  }
}
