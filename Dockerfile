FROM node:14-alpine

LABEL authors="irisp"

RUN apk update && apk upgrade

WORKDIR /api-test/src

COPY src/package*.json ./

RUN npm install

COPY . .

CMD [ "node", "src/server.js" ]