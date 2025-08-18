# Multi-stage build for server + static client
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY server/package.json server/
RUN npm ci

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

FROM node:18-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4000
CMD ["npm", "--workspace", "server", "run", "start"]

