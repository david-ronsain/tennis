import 'reflect-metadata';
import express from 'express';
import { config } from 'core/config/config';
import { routingControllerOptions } from './config/routingControllerOptions';
import { useExpressServer } from 'routing-controllers';
import { mongoLoader, swaggerLoader, winstonLoader } from './src/loaders';
import { loadSubscribers } from './src/subscribers';
import cors from 'cors';

const app = express();
app.use(cors());
mongoLoader();
useExpressServer(app, routingControllerOptions);
swaggerLoader({ app });
winstonLoader({ app });
loadSubscribers();

app.listen(config.MATCHES_API.PORT);

export { app };
