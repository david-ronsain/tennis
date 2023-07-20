import {
  ConnectedSocket,
  EmitOnSuccess,
  MessageBody,
  OnConnect,
  OnDisconnect,
  OnMessage,
  SocketController,
  SocketIO,
  SocketQueryParam,
  SocketRooms
} from 'socket-controllers';
import { MatchService } from '../services/matchService';
import { Service, Container } from 'typedi';
import { MatchResponse as Match } from 'core/responses';

let service: MatchService;

@SocketController('/matches')
@Service()
export class MatchController {
  constructor() {
    service = Container.get(MatchService);
  }

  @OnConnect()
  join(@ConnectedSocket() socket: any, @SocketIO() io: any) {
    socket.join('tennis');
  }

  @OnMessage('score_updated')
  @EmitOnSuccess('new_score')
  scoreUpdated(
    @SocketQueryParam('token') token: string,
    @SocketIO() io: any,
    @MessageBody() match: Match
  ) {
    //service.scoreUpdate(token, match);
    //console.log(await io.of('/matches').in('tennis').fetchSockets().map((e: {id: string}) => e.id))
    io.of('/matches').in('tennis').emit('new_score', match);
    return match;
  }

  @OnDisconnect()
  leave(@ConnectedSocket() socket: any) {
    socket.leave('tennis');
  }
}
