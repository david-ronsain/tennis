import { Middleware, MiddlewareInterface } from 'socket-controllers';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

@Middleware()
export class AuthenticationMiddleware implements MiddlewareInterface {
  use(
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
    next: (err?: any) => any
  ) {
    console.log(socket);
    next();
  }
}
