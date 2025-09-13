# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm i -g pnpm && pnpm i && pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

