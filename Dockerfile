FROM node:20-alpine AS base
# Use a multi-stage build to reduce the image size
# Stage 1: Build the application
FROM base as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Setup the production environment
FROM base as setup

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD [ "node", "dist/main"]