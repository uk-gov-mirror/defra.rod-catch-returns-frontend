
ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY / /app

RUN npm install pm2 -g && npm i

USER node

EXPOSE 4000

ENTRYPOINT [ "pm2-dev", "ecosystem.config.yml" ]