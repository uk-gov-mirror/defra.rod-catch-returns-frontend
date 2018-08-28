/**
 * Year handler
 */
const BaseHandler = require('./base')
const years = [
  { value: 2018, text: '2018' },
  { value: 2019, text: '2019' }
]

module.exports = class YearHandler extends BaseHandler {
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
    let cache = await request.cache().get()
    if (cache.errors) {
      return h.view(this.path, { years, errors: cache.errors })
    } else {
      return h.view(this.path, { years })
    }
  }

  async doPost (request, h, errors) {
    if (errors) {
      // Write the errors into the cache
      let cache = await request.cache().get()
      cache.errors = errors
      await request.cache().set(cache)
      return h.redirect('/select-year')
    } else {
      let cache = await request.cache().get()
      if (cache.errors) {
        delete cache.errors
        await request.cache().set(cache)
        return h.redirect('/return')
      }
    }
  }
}
