const Client = require('../api/client')

const testJSAPI = async (request, h) => {
  console.log('calling JS API using existing api client')
  const result = await Client.request(undefined, Client.method.GET, 'profile')
  return result
}

const testJSAPIFetch = async (request, h) => {
  const url = `${process.env.JS_API_URL}/api/profile`

  console.log('calling JS API using fetch')
  console.log(url)
  const proxyVars = ['HTTP_PROXY', 'http_proxy', 'HTTPS_PROXY', 'https_proxy', 'NO_PROXY', 'no_proxy']
  proxyVars.forEach(key => {
    if (process.env[key]) {
      console.log(`${key} = ${process.env[key]}`)
    }
  })

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

const testJavaAPIFetch = async (request, h) => {
  const url = new URL(`http://${process.env.API_HOSTNAME}:${process.env.API_PORT}/api/profile`)

  console.log('calling Java API using fetch')
  console.log(url)
  const proxyVars = ['HTTP_PROXY', 'http_proxy', 'HTTPS_PROXY', 'https_proxy', 'NO_PROXY', 'no_proxy']
  proxyVars.forEach(key => {
    if (process.env[key]) {
      console.log(`${key} = ${process.env[key]}`)
    }
  })

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

module.exports = {
  testJSAPI,
  testJSAPIFetch,
  testJavaAPIFetch
}
