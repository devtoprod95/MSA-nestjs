FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

COPY pnpm-lock.json ./

RUN npm i -g pnpm

RUN pnpm i

COPY . .

CMD ["pnpm", "start:dev", "user"]
