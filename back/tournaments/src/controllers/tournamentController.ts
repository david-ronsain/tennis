import {
  JsonController,
  Get,
  Authorized,
  Body,
  Post,
  HttpCode,
  Param,
  Put,
  QueryParam,
  QueryParams
} from 'routing-controllers';
import { TournamentService } from '../services/tournamentService';
import Container from 'typedi';
import { GetTournamentsRequest, TournamentRequest } from 'core/requests';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Tournament } from '../entities/tournamentEntity';
import { TournamentResponse } from 'core/responses';

let service: TournamentService;

@JsonController()
export class TournamentController {
  constructor() {
    service = Container.get(TournamentService);
  }

  @Get('')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a list of tournaments' })
  @ResponseSchema(Tournament, { isArray: true })
  async list(
    @QueryParams() request: GetTournamentsRequest
  ): Promise<Tournament[]> {
    return await service.list(request);
  }

  @Get('/count')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns the number of tournaments' })
  @ResponseSchema(Number)
  async count(@QueryParams() request: GetTournamentsRequest): Promise<number> {
    return await service.count(request);
  }

  @Get('/:id')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a tournament by its id' })
  @ResponseSchema(TournamentResponse)
  async getById(@Param('id') id: string): Promise<TournamentResponse> {
    return await service.getById(id);
  }

  @Post('')
  @HttpCode(201)
  @Authorized()
  @OpenAPI({ summary: 'Creates a new tournament' })
  @ResponseSchema(Tournament)
  async create(@Body() tournament: TournamentRequest): Promise<Tournament> {
    return await service.create(tournament);
  }

  @Put('/:id')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Updates an existing tournament' })
  @ResponseSchema(Tournament)
  async update(
    @Body() tournament: TournamentRequest,
    @Param('id') id: string
  ): Promise<Tournament> {
    return await service.update(id, tournament);
  }
}
