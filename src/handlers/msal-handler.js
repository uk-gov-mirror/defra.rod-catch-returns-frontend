const msal = require("@azure/msal-node");
const Boom = require('@hapi/boom');
const { name } = require("browser-sync");
const { v4: uuid } = require('uuid')

const config = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    clientSecret: process.env.MSAL_CLIENT_SECRET,
    authority: process.env.MSAL_ENDPOINT,
    redirectUri: process.env.MSAL_REDIRECT_URI,
  },
};

const msalClient = new msal.ConfidentialClientApplication(config);

const initialiseAuth = (server) => {
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: "sid",
      password: process.env.COOKIE_PW,
      ttl: null,
      isSecure: process.env.NODE_ENV !== "development",
      isHttpOnly: process.env.NODE_ENV !== "development",
      isSameSite: "Lax",
      path: "/",
    },
    redirectTo: "/login",
  });

  server.auth.default("session");
};

const signInUrl = async (_, h) => {
  const authUrl = await msalClient.getAuthCodeUrl({
    scopes: [`${process.env.MSAL_CLIENT_ID}/.default`],
    redirectUri: config.auth.redirectUri,
    responseMode: 'form_post'
  });
  return h.redirect(authUrl);
};

const oidcSignIn = async (request, h) => {
  const { code } = request.payload;
  if (!code) {
    return Boom.unauthorized("No authorization code provided");
  }

  try {
    const tokenResponse = await msalClient.acquireTokenByCode({
      code,
      scopes: [],
      redirectUri: config.auth.redirectUri,
    });

    request.cookieAuth.set({
      name: tokenResponse.account.name,
      token: tokenResponse.accessToken,
      sid: uuid() 
    });

    await request.cache().set({ authorization: {name} })

    return h.redirect("/");
  } catch (error) {
    console.error("Auth error:", error);
    return Boom.unauthorized("Authentication failed");
  }
};

module.exports = {
  initialiseAuth, signInUrl, oidcSignIn
}
