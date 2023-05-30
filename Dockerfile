FROM node:16-bullseye-slim AS hardhat

WORKDIR /usr/src/app

COPY package*.json ./

COPY hardhat.config.ts ./

COPY tsconfig.json ./

RUN npm ci 

COPY $PWD/entrypoint-hardhat.sh /usr/local/bin

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint-hardhat.sh"]


FROM node:16-bullseye-slim AS frontend

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

WORKDIR /usr/src/app

COPY . ./

COPY $PWD/entrypoint-frontend.sh /usr/local/bin

ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint-frontend.sh"]
