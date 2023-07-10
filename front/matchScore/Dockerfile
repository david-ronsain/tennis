FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install && cd front/matchScore

WORKDIR /app/front/matchScore

RUN npm install

EXPOSE 2004

CMD ["npm", "run", "start:dev"]