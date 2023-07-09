import { config } from 'core/config/config';
import { MongoClient } from 'mongodb';

export default () => {
  const client = new MongoClient(
    config.CORE.DB.MONGO.TYPE +
      '://' +
      config.CORE.DB.MONGO.HOST +
      ':' +
      config.CORE.DB.MONGO.PORT.toString()
  );

  try {
    void client.connect();
  } catch (e) {
    console.error(e);
  }
};
