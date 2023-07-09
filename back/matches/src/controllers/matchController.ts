import {
  JsonController,
  Authorized,
  Body,
  Post,
  HttpCode,
  Param,
  Put,
  Get,
  QueryParams
} from 'routing-controllers';
import { MatchService } from '../services/matchService';
import Container from 'typedi';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Match } from '../entities/MatchEntity';
import { ListMatchesRequest, MatchRequest } from 'core/requests/MatchRequest';
import { ITeam } from 'core/interfaces';
import { MatchResponse } from 'core/responses';

let service: MatchService;

@JsonController()
export class MatchController {
  constructor() {
    service = Container.get(MatchService);
  }

  @Get('')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a list of matches' })
  @ResponseSchema(MatchResponse, { isArray: true })
  async list(
    @QueryParams() request: ListMatchesRequest
  ): Promise<MatchResponse[]> {
    return await service.list(request);
  }

  @Get('/count')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns the number of matches' })
  @ResponseSchema(Number)
  async count(@QueryParams() request: ListMatchesRequest): Promise<number> {
    return await service.count(request);
  }

  @Post('')
  @HttpCode(201)
  @Authorized()
  @OpenAPI({ summary: 'Creates a match' })
  @ResponseSchema(Match)
  async create(@Body() request: MatchRequest): Promise<Match> {
    return await service.create(request);
  }

  @Put('/:id')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Updates an existing match' })
  @ResponseSchema(Match)
  async update(
    @Body() request: MatchRequest,
    @Param('id') id: string
  ): Promise<Match> {
    return await service.update(id, request);
  }

  @Put('/:id/:playerId')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Updates the score of a match' })
  @ResponseSchema(Boolean)
  async updateScore(
    @Param('id') matchId: string,
    @Param('playerId') playerId: string
  ): Promise<boolean> {
    return await service.updateScore(matchId, playerId);
  }

  @Put('/assign/next/:id')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Assign a team to the next match' })
  @ResponseSchema(Match)
  async assignTeamToMatch(
    @Param('id') id: string,
    @Body() team: ITeam
  ): Promise<Match> {
    return service.assignTeamToMatch(id, team);
  }
}
