/**
 * List wrapper for a given entity. A mapper function may be provided which operates on
 * results which return a set of items.
 * @param entity
 * @return {Promise.<*>}
 */

const Client = require('./client')
const Url = require('url')

module.exports = class EntityApi {
  constructor (path, entityName = path, mapper = async (e) => {
    return {
      id: this.keyFromLink(e),
      name: e.name
    }
  }) {
    this.path = path
    this.entityName = entityName
    this.mapper = mapper
  }

  keyFromLink (obj) {
    return Url.parse(obj._links.self.href).path.replace(process.env.API_PATH + '/', '')
  }

  async add (payload) {
    const result = await Client.request(Client.method.POST, this.path, null, payload)
    result.id = this.keyFromLink(result)
    return result
  }

  async list () {
    const result = await Client.request(Client.method.GET, this.path)
    return Promise.all(result._embedded[this.entityName].map(await this.mapper))
  }

  async getFromLink (link) {
    const result = await Client.requestFromLink(link)
    if (result._embedded) {
      return Promise.all(result._embedded[this.entityName].map(await this.mapper))
    } else {
      result.id = this.keyFromLink(result)
      return result
    }
  }

  async searchFunction (searchFunction, query) {
    const result = await Client.request(Client.method.GET, this.path + `/search/${searchFunction}`, query)

    if (!result) {
      return null
    }

    if (result._embedded) {
      return Promise.all(result._embedded[this.entityName].map(await this.mapper))
    } else {
      result.id = this.keyFromLink(result)
      return result
    }
  }
}
