# rod-catch-returns-frontend

[![Build Status](https://travis-ci.org/DEFRA/rod-catch-returns-frontend.svg?branch=master)](https://travis-ci.org/DEFRA/rod-catch-returns-frontend)
[![Maintainability](https://api.codeclimate.com/v1/badges/ab06e6ad0035b726aed5/maintainability)](https://codeclimate.com/github/DEFRA/rod-catch-returns-frontend/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ab06e6ad0035b726aed5/test_coverage)](https://codeclimate.com/github/DEFRA/rod-catch-returns-frontend/test_coverage)

When you purchase a migratory salmon and sea trout rod licence, you are legally required to submit a catch return, which is a log of the fish caught that season. Users are sent a paper copy of the catch return form with their licence, and also directed towards the catch return website.

Users are asked to submit details of the fish they caught (species, weight, number etc) and where they caught them.

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
# Redis
REDIS_HOSTNAME=0.0.0.0
REDIS_PORT=6379

# Logging level
LOG_LEVEL=debug

# Cookie **CHANGE THIS** encryption key for the user authorization cookie session key
COOKIE_PW=562fhgfqaj626ba87212ausaiqjqw112

HTTPS=false
```
