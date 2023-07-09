import 'dotenv/config';
import { IConfig } from '../interfaces/IConfig';

const config: IConfig = {
  CORE: {
    NODE_ENV: process.env.NODE_ENV ?? 'dev',
    JWT_SECRET: process.env.JWT_SECRET ?? '',
    JWT_VALIDITY: process.env.JWT_VALIDITY ?? '',
    MASTER_LOGIN: process.env.MASTER_LOGIN ?? '',
    MASTER_PASSWORD: process.env.MASTER_PASSWORD ?? '',
    DB: {
      MONGO: {
        TYPE: 'mongodb',
        HOST: process.env.MONGO_HOST ?? '',
        PORT: new Number(process.env.MONGO_PORT).valueOf(),
        USER: process.env.MONGO_USER ?? '',
        PASSWORD: process.env.MONGO_PASSWORD ?? '',
        DB_NAME: process.env.MONGO_DB_NAME ?? '',
        ENTITIES: process.env.MONGO_ENTITIES ?? '',
        SYNC: new Boolean(process.env.MONGO_SYNC).valueOf(),
        LOGGING: new Boolean(process.env.MONGO_LOGGING).valueOf()
      }
    }
  },
  PLAYERS_API: {
    PORT: new Number(process.env.PLAYERS_API_PORT).valueOf(),
    ROUTE_PREFIX: process.env.PLAYERS_API_ROUTE_PREFIX ?? '',
    URL: process.env.PLAYERS_API_URL ?? ''
  },
  TOURNAMENTS_API: {
    PORT: new Number(process.env.TOURNAMENTS_API_PORT).valueOf(),
    ROUTE_PREFIX: process.env.TOURNAMENTS_API_ROUTE_PREFIX ?? '',
    URL: process.env.TOURNAMENTS_API_URL ?? ''
  },
  CALENDAR_API: {
    PORT: new Number(process.env.CALENDAR_API_PORT).valueOf(),
    ROUTE_PREFIX: process.env.CALENDAR_API_ROUTE_PREFIX ?? '',
    URL: process.env.CALENDAR_API_URL ?? ''
  },
  MATCHES_API: {
    PORT: new Number(process.env.MATCHES_API_PORT).valueOf(),
    ROUTE_PREFIX: process.env.MATCHES_API_ROUTE_PREFIX ?? '',
    URL: process.env.MATCHES_API_URL ?? '',
    SOCKET_PORT: new Number(process.env.MATCHES_API_SOCKET_PORT).valueOf()
  },
  WEBSOCKET_API: {
    PORT: new Number(process.env.WEBSOCKET_API_PORT).valueOf(),
    ROUTE_PREFIX: process.env.WEBSOCKET_API_ROUTE_PREFIX ?? '',
    URL: process.env.WEBSOCKET_API_URL ?? ''
  },
  FRONT: {
    MAIN: {
      PORT: new Number(process.env.MAIN_FRONT_PORT).valueOf()
    }
  }
};

export { config };
