const LicenceHandler = require('../handlers/licence')
const licenceValidator = require('../validators/licence')

const licenceHandler = new LicenceHandler('licence', licenceValidator)
const licenceHandlerFnc = async (request, h) => { return licenceHandler.handler(request, h) }

module.exports = [

  // Test handler for direct output
  {
    path: '/',
    method: 'GET',
    handler: (request, h) => {
      return h.redirect('/licence')
    }
  },

  // Licence handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandlerFnc
  }
]
