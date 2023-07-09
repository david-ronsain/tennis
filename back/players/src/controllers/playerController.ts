import {
  JsonController,
  Get,
  Authorized,
  Body,
  Post,
  HttpCode,
  Param,
  Put,
  Patch,
  QueryParams
} from 'routing-controllers';
import { PlayerService } from '../services/playerService';
import Container from 'typedi';
import { PlayerRequest } from 'core/requests';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Player } from '../entities/playerEntity';
import { GetPlayersRequest } from 'core/requests/PlayerRequest';

let service: PlayerService;

@JsonController()
export class PlayerController {
  constructor() {
    service = Container.get(PlayerService);
  }

  @Get('')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a list of players' })
  @ResponseSchema(Player, { isArray: true })
  async list(@QueryParams() request: GetPlayersRequest): Promise<Player[]> {
    return await service.list(request);
  }

  @Patch('/count')
  @HttpCode(200)
  @OpenAPI({ summary: 'count the players' })
  @ResponseSchema(Number)
  async count(@QueryParams() request: GetPlayersRequest): Promise<number> {
    return await service.count(request);
  }

  @Get('/:id')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a player by its id' })
  @ResponseSchema(Player)
  async getById(@Param('id') id: string): Promise<Player> {
    return await service.getById(id);
  }

  @Post('')
  @HttpCode(201)
  @Authorized()
  @OpenAPI({ summary: 'Creates a new player' })
  @ResponseSchema(Player)
  async create(@Body() player: PlayerRequest): Promise<Player> {
    return await service.create(player);
  }

  @Put('/:id')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Updates an existing player' })
  @ResponseSchema(Player)
  async update(
    @Body() player: PlayerRequest,
    @Param('id') id: string
  ): Promise<Player> {
    return await service.update(id, player);
  }
}
