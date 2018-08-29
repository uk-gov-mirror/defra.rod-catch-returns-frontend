/**
 * Summary handler
 */
const BaseHandler = require('./base')

const rivers = [
  {
    name: 'Derwent (Cumbria)',
    daysFished: 10
  },
  {
    name: 'Trent',
    daysFished: 4
  }
]

const fish = [
  {
    river: 'Derwent (Cumbria)',
    date: '08/18',
    type: 'Salmon',
    weight: '10lb 2oz',
    method: 'Fly',
    released: 'Yes'
  },
  {
    river: 'Trent',
    date: '03/18',
    type: 'Salmon',
    weight: '10lb 8oz',
    method: 'Spinner',
    released: 'Yes'
  }
]

module.exports = class SummaryHandler extends BaseHandler {
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
    return h.view(this.path, { rivers, fish })
  }

  async doPost (request, h, errors) {
    return h.redirect('/summary')
  }
}
