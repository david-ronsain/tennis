FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd front/backoffice

WORKDIR /app/front/backoffice

RUN npm install

EXPOSE 2003

CMD ["npm", "run", "start:dev"]