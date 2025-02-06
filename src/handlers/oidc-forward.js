const Client = require('../api/client')
const { v4: uuid } = require('uuid')

const signIn = async (request, h) => {
  const result = await Client.request(null, Client.method.POST, 'oidc/callback', null, request.payload)

  request.cookieAuth.set({ sid: uuid() })
  request.cookieAuth.ttl(result.expiresAt)

  await request.cache().set({ authorization: result.token })
  return h.redirect('/licence')
}

const authorize = async (request, h) => {
  const result = await Client.request(null, Client.method.GET, 'oidc/authorize')
  return h.redirect(result.authorizationUrl)
}

module.exports = {
  signIn,
  authorize
}
