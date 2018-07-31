# rod-catch-returns-frontend

## To build
```
npm i
gulp
```
## To Run
`npm start`

http://localhost:3000

## Environment file
The service will require a .env file in the root directory. Below is an example

```
#!/bin/sh

# Redis
REDIS_HOSTNAME=0.0.0.0
REDIS_PORT=6379

# Logging level
LOG_LEVEL=debug

# Cookie **CHANGE THIS** encryption key for the user authorization cookie session key
COOKIE_PW=vghu8jkhg6766((^^7VkhjgvTG796kjhbOHsqa&gsVJ
```