import { authorizationChecker } from 'core/middlewares/authentication';
import { PlayerController } from '../src/controllers/playerController';
import { config } from 'core/config/config';
import { CustomErrorHandler } from 'core/middlewares/errorHandler';

export const routingControllerOptions = {
  authorizationChecker,
  controllers: [PlayerController],
  routePrefix: config.PLAYERS_API.ROUTE_PREFIX,
  defaultErrorHandler: false,
  middlewares: [CustomErrorHandler]
};
