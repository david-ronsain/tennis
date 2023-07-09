import 'reflect-metadata';
import { socketConfig } from './config/socketControllerOptions';
import { SocketControllers } from 'socket-controllers';
import express from 'express';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from 'core/config/config';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = new HttpServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

httpServer.listen(config.WEBSOCKET_API.PORT);

io.use((socket: any, next: Function) => {
  console.log('Custom middleware');
  next();
});

new SocketControllers({ ...socketConfig, io });
