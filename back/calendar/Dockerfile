FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd back/calendar

WORKDIR /app/back/calendar

RUN npm install

EXPOSE 3002

CMD ["npm", "run", "start:dev"]