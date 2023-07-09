interface IConfig {
  CORE: CoreConfig;

  PLAYERS_API: ApiConfig;

  TOURNAMENTS_API: ApiConfig;

  CALENDAR_API: ApiConfig;

  MATCHES_API: ApiConfig;

  WEBSOCKET_API: ApiConfig;

  FRONT: FrontConfig;
}

interface FrontConfig {
  MAIN: FrontVueConfig;
}

interface FrontVueConfig {
  PORT: number;
}

interface CoreConfig {
  JWT_SECRET: string;

  JWT_VALIDITY: string;

  MASTER_LOGIN: string;

  MASTER_PASSWORD: string;

  DB: CoreDbConfig;

  NODE_ENV: string;
}

interface CoreDbConfig {
  MONGO: CoreDbMongoConfig;
}

interface CoreDbMongoConfig {
  TYPE: 'mongodb';

  HOST: string;

  PORT: number;

  USER: string;

  PASSWORD: string;

  DB_NAME: string;

  ENTITIES: string;

  SYNC: boolean;

  LOGGING: boolean;
}

interface ApiConfig {
  PORT: number;

  ROUTE_PREFIX: string;

  URL: string;

  SOCKET_PORT?: number;
}

export type { IConfig };
