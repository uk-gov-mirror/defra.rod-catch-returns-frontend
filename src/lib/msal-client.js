const msal = require('@azure/msal-node')
const { HttpsProxyAgent } = require('https-proxy-agent')

/** @type {msal.Configuration} */
const config = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    clientSecret: process.env.MSAL_CLIENT_SECRET,
    authority: process.env.MSAL_ENDPOINT
  },
  system: {
    customAgentOptions: new HttpsProxyAgent(process.env.https_proxy),
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
    }
  }
}

const msalClient = new msal.ConfidentialClientApplication(config)

module.exports = {
  msalClient
}
