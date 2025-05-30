const msal = require('@azure/msal-node')
const axios = require('axios')
const { HttpsProxyAgent } = require('https-proxy-agent')

const proxyUrl = process.env.https_proxy
const proxyAgent = new HttpsProxyAgent(proxyUrl)

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
    /*
     * Workaround use native axios with our proxy settings
     * Original HTTP client used by msal-node: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/src/network/HttpClient.ts
     * Github issue related: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/6527#issuecomment-2073238927
     */
    networkClient: {
      sendGetRequestAsync: async (url, options) => {
        const res = await axios.get(url, {
          headers: options.headers,
          httpsAgent: proxyAgent
        })

        return {
          headers: res.headers,
          body: res.data,
          status: res.status
        }
      },
      sendPostRequestAsync: async (url, options) => {
        const res = await axios.post(url, options.body, {
          headers: options.headers,
          httpsAgent: proxyAgent
        })

        return {
          headers: res.headers,
          body: res.data,
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
