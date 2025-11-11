FROM node:18-bullseye-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

FROM base AS dev
WORKDIR /usr/src/app
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS prod
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


