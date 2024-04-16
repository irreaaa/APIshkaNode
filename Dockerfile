FROM node:14-alpine

LABEL authors="irisp"

RUN apk update && apk upgrade

WORKDIR /api-test

COPY src/package*.json ./

RUN npm install

COPY src .

CMD [ "node", "server.js" ]