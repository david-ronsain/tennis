import { authorizationChecker } from 'core/middlewares';
import { MatchController } from '../src/controllers/matchController';
import { config } from 'core/config/config';
import { CustomErrorHandler } from 'core/middlewares';

export const routingControllerOptions = {
  authorizationChecker,
  controllers: [MatchController],
  routePrefix: config.MATCHES_API.ROUTE_PREFIX,
  defaultErrorHandler: false,
  middlewares: [CustomErrorHandler]
};
