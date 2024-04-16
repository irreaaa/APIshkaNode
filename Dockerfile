FROM ubuntu:latest
LABEL authors="irisp"
ENTRYPOINT ["top", "-b"]

FROM node:14

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /api-test

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]
