import { MatchController } from '../src/controllers/matchController';
import { config } from 'core/config/config';
import { CustomErrorHandler } from 'core/middlewares/errorHandler';
import { SocketControllersOptions } from 'socket-controllers';
import { AuthenticationMiddleware } from '../src/middlewares/authentication';
import { Container } from 'typedi';

export const socketConfig: SocketControllersOptions = {
  port: config.WEBSOCKET_API.PORT,
  container: Container,
  controllers: [MatchController],
  middlewares: [/*CustomErrorHandler, */ AuthenticationMiddleware]
};
