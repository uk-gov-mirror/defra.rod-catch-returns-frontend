const LicenceHandler = require('../handlers/licence')
const licenceValidator = require('../validators/licence')

const licenceHandler = new LicenceHandler('licence', licenceValidator)
const licenceHandlerFnc = async (request, h) => { return licenceHandler.handler(request, h) }

module.exports = [

  // Test handler for direct output
  {
    path: '/test1',
    method: 'GET',
    handler: () => {
      return 'test1'
    }
  },

  // Licence handler
  {
    path: '/licence',
    method: ['GET', 'POST'],
    handler: licenceHandlerFnc
  }
]
