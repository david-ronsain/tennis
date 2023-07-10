FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd front/tournaments

WORKDIR /app/front/tournaments

RUN npm install

EXPOSE 2002

CMD ["npm", "run", "start:dev"]