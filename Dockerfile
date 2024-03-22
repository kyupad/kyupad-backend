FROM node:18.19-alpine

WORKDIR /usr/src/app/kyupad-api

COPY . .

RUN npm install ---loglevel=error

CMD [ "npm", "start" ]