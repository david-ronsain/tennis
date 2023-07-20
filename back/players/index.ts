import 'reflect-metadata';
import express from 'express';

import { config } from 'core/config/config';
import { routingControllerOptions } from './config/routingControllerOptions';
import { useExpressServer } from 'routing-controllers';
import { mongoLoader, swaggerLoader, winstonLoader } from './src/loaders';
import cors from 'cors';

const app = (module.exports = express());
app.use(cors());
mongoLoader();
useExpressServer(app, routingControllerOptions);
swaggerLoader({ app });
winstonLoader({ app });
app.listen(config.PLAYERS_API.PORT);
