FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd back/tournaments

WORKDIR /app/back/tournaments

RUN npm install

EXPOSE 3001

CMD ["npm", "run", "start:dev"]