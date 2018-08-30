/**
 * Salmon and large trout handler
 */
const BaseHandler = require('./base')

const rivers = [
  { id: 0, name: 'Derwent (Cumbria)' },
  { id: 1, name: 'Trent' }
].sort((a, b) => {
  if (a.name < b.name) {
    return -1
  }
  if (a.name > b.name) {
    return 1
  }
  return 0
})

const year = 2018

const types = [ 'Salmon', 'Sea trout' ]
const methods = [ 'Fly', 'Spinner', 'Bait' ]

module.exports = class SalmonAndLargeTroutHandler extends BaseHandler {
  constructor (...args) {
    super(args)
  }

  /**
   * Get handler for select salmon and large trout page
   * @param request
   * @param h
   * @param user
   * @returns {Promise<*>}
   */
  async doGet (request, h) {
    return super.readCacheAndDisplayView(request, h, { rivers, year, types, methods })
  }

  /**
   * Post handler for the select salmon and large trout page
   * @param request
   * @param h
   * @param errors
   * @returns {Promise<*>}
   */
  async doPost (request, h, errors) {
    return super.writeCacheAndRedirect(request, h, errors, '/summary',
      `/salmon-and-large-trout/${encodeURIComponent(request.params.id)}`)
  }
}
