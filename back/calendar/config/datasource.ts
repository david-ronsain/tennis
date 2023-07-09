import { DataSource } from 'typeorm';
import { config } from 'core/config/config';
import * as path from 'path';

export default new DataSource({
  type: config.CORE.DB.MONGO.TYPE,
  host: config.CORE.DB.MONGO.HOST,
  port: config.CORE.DB.MONGO.PORT,
  username: config.CORE.DB.MONGO.USER,
  password: config.CORE.DB.MONGO.PASSWORD,
  database: config.CORE.DB.MONGO.DB_NAME,
  entities: [path.join(__dirname, config.CORE.DB.MONGO.ENTITIES)],
  synchronize: config.CORE.DB.MONGO.SYNC,
  logging: config.CORE.DB.MONGO.LOGGING
}).initialize();
