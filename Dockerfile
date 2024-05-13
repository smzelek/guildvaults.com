FROM node:20-slim

WORKDIR /usr/src/app


COPY package.json .

RUN npm i

COPY . .

RUN npm run build:server

ENTRYPOINT ["npm", "run", "start"]
