# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN npm i -g pnpm && pnpm i --filter backend... --prod=false || true

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm i -g pnpm && pnpm i --filter backend... --prod=false && pnpm --filter backend build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/backend/dist ./dist
COPY backend/package.json ./package.json
RUN npm i -g pnpm && pnpm i --prod
EXPOSE 8787
CMD ["node", "dist/index.js"]

