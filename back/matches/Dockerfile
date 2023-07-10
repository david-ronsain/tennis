FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd back/matches

WORKDIR /app/back/matches

RUN npm install

EXPOSE 3003

CMD ["npm", "run", "start:dev"]