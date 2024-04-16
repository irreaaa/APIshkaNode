FROM node:14-alpine

LABEL authors="irisp"

RUN apk update && apk upgrade

WORKDIR /api-test

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "server.js" ]