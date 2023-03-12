FROM node:18.11 AS build

COPY . /app

WORKDIR /app

RUN curl https://install.meteor.com/ | sh

RUN meteor npm install

RUN meteor build --allow-superuser  ./dist  --directory

FROM node:14-alpine

WORKDIR /app

RUN apk update && apk add --virtual build-dependencies build-base gcc wget git


RUN apk update && apk add mongodb mongodb-tools
RUN apk add --virtual build-dependencies build-base gcc wget git python

RUN mkdir -p /data/db

RUN npm install -g pm2 

EXPOSE 80

COPY --from=build /app/dist/bundle /app/

ENV ROOT_URL=http://localhost
ENV MONGO_URL=mongodb://localhost:27017/wzc

RUN cd programs/server && npm install

CMD ["node", "main.js"]