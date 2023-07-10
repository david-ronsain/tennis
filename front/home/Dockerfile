FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd front/home

WORKDIR /app/front/home

RUN npm install

EXPOSE 2001

CMD ["npm", "run", "start:dev"]