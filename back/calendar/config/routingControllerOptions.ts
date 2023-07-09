import { authorizationChecker } from 'core/middlewares';
import { CalendarController } from '../src/controllers/calendarController';
import { config } from 'core/config/config';
import { CustomErrorHandler } from 'core/middlewares';

export const routingControllerOptions = {
  authorizationChecker,
  controllers: [CalendarController],
  routePrefix: config.CALENDAR_API.ROUTE_PREFIX,
  defaultErrorHandler: false,
  middlewares: [CustomErrorHandler]
};
