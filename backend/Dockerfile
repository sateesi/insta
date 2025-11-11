FROM node:18-bullseye-slim AS base
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
ENV PYTHON=python3
RUN npm install

FROM base AS dev
WORKDIR /usr/src/app
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build

FROM node:18-bullseye-slim AS prod
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
ENV PYTHON=python3
RUN npm install --omit=dev
COPY --from=build /usr/src/app/dist ./dist
CMD ["npm", "run", "start"]

