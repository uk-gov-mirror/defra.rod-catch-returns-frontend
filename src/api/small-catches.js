'use strict'

const EntityApi = require('./entity-api')
const RiversApi = require('../api/rivers')
const MethodsApi = require('../api/methods')

const riversApi = new RiversApi()
const methodsApi = new MethodsApi()

/**
 * Small catches entity handler
 *
 */
module.exports = class CatchesApi extends EntityApi {
  constructor () {
    super('smallCatches', async (c) => {
      const river = await riversApi.getFromLink(c._links.river.href)

      const counts = await Promise.all(c.counts.map(async m => {
        return { method: await methodsApi.doMap(await methodsApi.getFromLink(m._links.method.href)), count: m.count }
      }))

      return {
        id: this.keyFromLink(c),
        month: c.month,
        counts: counts,
        released: c.released,
        river: {
          id: this.keyFromLink(river),
          name: river.name
        }
      }
    })
  }

  async add (submissionId, riverId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list()
    return super.add({
      submission: submissionId,
      river: riverId,
      month: month,
      released: released,
      counts: [
        {
          method: methods.find(m => m.name.toLowerCase() === 'fly').id,
          count: fly
        },
        {
          method: methods.find(m => m.name.toLowerCase() === 'spinner').id,
          count: spinner
        },
        {
          method: methods.find(m => m.name.toLowerCase() === 'bait').id,
          count: bait
        }
      ]
    })
  }

  async change (catchId, submissionId, riverId, month, fly, spinner, bait, released) {
    const methods = await methodsApi.list()
    return super.change(catchId, {
      submission: submissionId,
      river: riverId,
      month: month,
      released: released,
      counts: [
        {
          method: methods.find(m => m.name.toLowerCase() === 'fly').id,
          count: fly
        },
        {
          method: methods.find(m => m.name.toLowerCase() === 'spinner').id,
          count: spinner
        },
        {
          method: methods.find(m => m.name.toLowerCase() === 'bait').id,
          count: bait
        }
      ]
    })
  }
}
