const Client = require('../api/client')
const { HttpsProxyAgent } = require('https-proxy-agent')
const axios = require('axios')

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

const testMSFetchProxy = async () => {
  const proxyUrl = process.env.https_proxy
  const proxyAgent = new HttpsProxyAgent(proxyUrl)
  const url = 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'

  console.log('Microsoft endpoint using fetch with proxy')
  console.log(url)
  console.log(proxyAgent)

  const proxyVars = ['HTTP_PROXY', 'http_proxy', 'HTTPS_PROXY', 'https_proxy', 'NO_PROXY', 'no_proxy']
  proxyVars.forEach(key => {
    if (process.env[key]) {
      console.log(`${key} = ${process.env[key]}`)
    }
  })

  const response = await fetch(url, { agent: proxyAgent })

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

const testMSFetchWithoutProxy = async () => {
  const url = 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'

  console.log('Microsoft endpoint using fetch without proxy')
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

const testMSAxios= async () => {
  const url = 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration'

  console.log('Microsoft endpoint using axios')
  console.log(url)

  const result = await axios.get(url)

  return result.data
}

module.exports = {
  testMSFetchProxy,
  testMSFetchWithoutProxy,
  testJSAPI,
  testJSAPIFetch,
  testJavaAPIFetch,
  testMSAxios
}
