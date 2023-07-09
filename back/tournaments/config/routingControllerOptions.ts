import { authorizationChecker } from 'core/middlewares/authentication';
import { TournamentController } from '../src/controllers/tournamentController';
import { config } from 'core/config/config';
import { CustomErrorHandler } from 'core/middlewares/errorHandler';

export const routingControllerOptions = {
  authorizationChecker,
  controllers: [TournamentController],
  routePrefix: config.TOURNAMENTS_API.ROUTE_PREFIX,
  defaultErrorHandler: false,
  middlewares: [CustomErrorHandler]
};
