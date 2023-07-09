FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN apt-get update
RUN apt-get install build-essential gcc
RUN npm install -g npm nodemon node-gyp ts-node tsc
RUN npm install

CMD ["npm", "run", "start:prod"]