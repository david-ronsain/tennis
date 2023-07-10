FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd back/players

WORKDIR /app/back/players

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:dev"]