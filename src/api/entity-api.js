'use strict'

/**
 * Root functions for a given entity. A mapper function may be provided which operates on
 * results which return a set of items.
 * @param entity
 * @return {Promise.<*>}
 */

const Client = require('./client')
const Url = require('url')

module.exports = class EntityApi {
  constructor (path, mapper = async (e) => {
    return {
      id: this.keyFromLink(e),
      name: e.name
    }
  }) {
    this.path = path
    this.mapper = mapper
  }

  // Calculate the object key from the link. Used in payloads
  keyFromLink (obj) {
    return Url.parse(obj._links.self.href).path.replace(process.env.API_PATH + '/', '')
  }

  // Add (POST) a new entity
  async add (payload) {
    const result = await Client.request(Client.method.POST, this.path, null, payload)
    result.id = this.keyFromLink(result)
    return result
  }

  // Change (PUT) an entity. The key encodes the entity path
  async change (key, payload) {
    const result = await Client.request(Client.method.PUT, key, null, payload)
    result.id = this.keyFromLink(result)
    return result
  }

  // Change (PUT) an entity. The key encodes the entity path
  async patch (key, payload) {
    const result = await Client.request(Client.method.PATCH, key, null, payload)
    result.id = this.keyFromLink(result)
    return result
  }

  // Spring data rest requires a specific operation to change relationships
  async changeAssoc (key, payload) {
    return Client.requestAssociationChange(key, payload)
  }

  // List all entities - used for reference data
  async list () {
    const result = await Client.request(Client.method.GET, this.path)
    return Promise.all(result._embedded[this.path].map(await this.mapper))
  }

  /*
   * Get either a list of entities or a single entity from an href.
   * if a single entity add tke key, otherwise execute the list mapper
   */
  async getFromLink (link) {
    const result = await Client.requestFromLink(link)
    if (result._embedded) {
      return Promise.all(result._embedded[this.path].map(await this.mapper))
    } else {
      result.id = this.keyFromLink(result)
      return result
    }
  }

  // Get a single entity by its id.
  async getById (id) {
    const result = await Client.request(Client.method.GET, id, null, null, false)
    if (result) {
      result.id = this.keyFromLink(result)
    }
    return result
  }

  // Delete a single entity by its id. Throws on a 404
  async deleteById (id) {
    await Client.request(Client.method.DELETE, id, null, null, true)
  }

  // Execute the (profile) search function
  async searchFunction (searchFunction, query) {
    const result = await Client.request(Client.method.GET, this.path + `/search/${searchFunction}`, query)

    if (!result) {
      return null
    }

    if (result._embedded) {
      return Promise.all(result._embedded[this.path].map(await this.mapper))
    } else {
      result.id = this.keyFromLink(result)
      return result
    }
  }

  // Apply the mapper to the result
  async doMap (o) {
    return this.mapper(o)
  }
}
