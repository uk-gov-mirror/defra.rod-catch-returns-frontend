/**
 * List wrapper for a given entity
 * @param entity
 * @return {Promise.<*>}
 */

const Client = require('./client')
const Url = require('url')

const defaultMapper = (e) => {
  return {
    id: Url.parse(e._links.self.href).path.replace(process.env.API_PATH + '/', ''),
    name: e.name
  }
}

module.exports = class EntityApi {
  constructor (path, entityName = path, mapper = defaultMapper) {
    this.path = path
    this.entityName = entityName
    this.mapper = mapper
  }

  async list () {
    const result = await Client.request(Client.method.GET, this.path)
    const arr = result._embedded[this.entityName].map(this.mapper)
    return arr
  }
}
