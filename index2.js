require('dotenv').config();
const Hapi = require('@hapi/hapi');
const msal = require('@azure/msal-node');
const Boom = require('@hapi/boom');
const CookieAuth = require('@hapi/cookie');

console.log(process.env.MSAL_CLIENT_SECRET)

const config = {
  auth: {
    clientId: process.env.MSAL_CLIENT_ID,
    clientSecret: process.env.MSAL_CLIENT_SECRET,
    authority: process.env.MSAL_ENDPOINT,
    redirectUri: process.env.MSAL_REDIRECT_URI
  }
};

const msalClient = new msal.ConfidentialClientApplication({
  auth: config.auth
});

const start = async () => {
  const server = Hapi.server({
    port: 4000,
    routes: { security: { noOpen: false } }
  });

  await server.register(CookieAuth);

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'auth-session',
      password: 'supersecretpasswordshouldbe32characters',
      ttl: null,
      isSecure: process.env.NODE_ENV !== 'development',
      isHttpOnly: process.env.NODE_ENV !== 'development',
      isSameSite: 'Lax',
      path: '/'
    },
    redirectTo: '/login'
  });

  server.auth.default('session');

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return `Hello, ${request.auth.credentials?.name || 'Guest'}`;
      }
    },
    {
      method: 'GET',
      path: '/login',
      options: { auth: false },
      handler: async (request, h) => {
        const authUrl = await msalClient.getAuthCodeUrl({
          scopes: ['user.read'],
          redirectUri: config.auth.redirectUri
        });
        return h.redirect(authUrl);
      }
    },
    {
      method: 'GET',
      path: '/oidc/signin',
      options: { auth: false },
      handler: async (request, h) => {
        const { code } = request.query;
        if (!code) {
          return Boom.unauthorized('No authorization code provided');
        }

        try {
          const tokenResponse = await msalClient.acquireTokenByCode({
            code,
            scopes: [],
            redirectUri: config.auth.redirectUri
          });

          request.cookieAuth.set({
            name: tokenResponse.account.name,
            token: tokenResponse.accessToken
          });

          console.log(tokenResponse.accessToken)

          return h.redirect('/');
        } catch (error) {
          console.error('Auth error:', error);
          return Boom.unauthorized('Authentication failed');
        }
      }
    },
    {
      method: 'GET',
      path: '/logout',
      handler: (request, h) => {
        request.cookieAuth.clear();
        return h.redirect('/');
      }
    }
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

start().catch(err => {
  console.error(err);
  process.exit(1);
});