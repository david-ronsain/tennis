import express from 'express';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';

export default ({ app }: { app: express.Application }) => {
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true,
      colorize: false,
      ignoreRoute: () => false
    })
  );
};
