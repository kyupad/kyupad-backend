# Use a multi-stage build to reduce the image size
# Stage 1: Build the application
FROM node:latest as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Setup the production environment
FROM node:alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 80

CMD [ "node", "dist/main"]