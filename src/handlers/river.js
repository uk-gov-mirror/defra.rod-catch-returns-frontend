const BaseHandler = require('./base')

const rivers = [
  { id: 0, name: 'Derwent (Cumbria)' },
  { id: 1, name: 'Trent' },
  { id: 2, name: 'Avon' },
  { id: 3, name: 'Seven' },
  { id: 4, name: 'Wye' }
].sort((a, b) => {
  if (a.name < b.name) {
    return -1
  }
  if (a.name > b.name) {
    return 1
  }
  return 0
})

module.exports = class RiverHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for select year page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return super.readCacheAndDisplayView(request, h, { rivers })
  }

  async doPost (request, h, errors) {
    return super.writeCacheAndRedirect(request, h, errors, '/summary', '/river')
  }
}
