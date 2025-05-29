const msal = require('@azure/msal-node')
const { HttpsProxyAgent } = require('https-proxy-agent')

const proxyUrl = process.env.https_proxy

/** @type {msal.Configuration} */
const config = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    clientSecret: process.env.MSAL_CLIENT_SECRET,
    authority: process.env.MSAL_ENDPOINT
  },
  system: {
    loggerOptions: {
      logLevel: msal.LogLevel.Verbose,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case msal.LogLevel.Error:
            console.error(message)
            return
          case msal.LogLevel.Info:
            console.log(message)
            return
          case msal.LogLevel.Verbose:
            console.log(message)
            return
          case msal.LogLevel.Warning:
            console.log(message)
        }
      },
      piiLoggingEnabled: false
    },
    networkClient: {
      sendGetRequestAsync: async (url, options) => {
        options.agent = new HttpsProxyAgent(proxyUrl)
        const res = await fetch(url, options)
        return {
          headers: res.headers.raw(),
          body: await res.text(),
          status: res.status
        }
      },
      sendPostRequestAsync: async (url, options) => {
        options.agent = new HttpsProxyAgent(proxyUrl)
        const res = await fetch(url, options)
        return {
          headers: res.headers.raw(),
          body: await res.text(),
          status: res.status
        }
      }
    }
  }
}

const msalClient = new msal.ConfidentialClientApplication(config)

module.exports = {
  msalClient
}
