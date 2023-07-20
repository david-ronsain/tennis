FROM node:18.16-bullseye

WORKDIR /app

COPY . .

RUN npm install

RUN rm /app/node_modules/core
RUN ln -s -f /app/core /app/node_modules/core

RUN rm /app/node_modules/back-calendar
RUN ln -s -f /app/back/calendar /app/node_modules/back-calendar

RUN rm /app/node_modules/back-matches
RUN ln -s -f /app/back/matches /app/node_modules/back-matches

RUN rm /app/node_modules/back-players
RUN ln -s -f /app/back/players /app/node_modules/back-players

RUN rm /app/node_modules/back-socket
RUN ln -s -f /app/back/socket /app/node_modules/back-socket

RUN rm /app/node_modules/back-tournaments
RUN ln -s -f /app/back/tournaments /app/node_modules/back-tournaments

RUN rm /app/node_modules/front-backoffice
RUN ln -s -f /app/front/backoffice /app/node_modules/front-backoffice

RUN rm /app/node_modules/front-home
RUN ln -s -f /app/front/home /app/node_modules/front-home

RUN rm /app/node_modules/front-main
RUN ln -s -f /app/front/main /app/node_modules/front-main

RUN rm /app/node_modules/front-match-score
RUN ln -s -f /app/back/socketfront/matchScore /app/node_modules/front-match-score

RUN rm /app/node_modules/front-tournament
RUN ln -s -f /app/front/tournament /app/node_modules/front-tournament