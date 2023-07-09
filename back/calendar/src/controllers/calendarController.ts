import {
  JsonController,
  Get,
  Authorized,
  Body,
  Post,
  HttpCode,
  Param,
  Put,
  QueryParams
} from 'routing-controllers';
import { CalendarService } from '../services/calendarService';
import Container from 'typedi';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Calendar } from '../entities/calendarEntity';
import { CalendarRequest, GetCalendarRequest } from 'core/requests';
import { ObjectId } from 'typeorm';
import { MatchType, PlayerCategory } from 'core/enums';
import { IMatch } from 'core/interfaces';
import { CalendarResponse } from 'core/responses';

let service: CalendarService;

@JsonController()
export class CalendarController {
  constructor() {
    service = Container.get(CalendarService);
  }

  @Get('')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a list of tournaments between two dates' })
  @ResponseSchema(CalendarResponse, { isArray: true })
  async list(
    @QueryParams() request: GetCalendarRequest
  ): Promise<CalendarResponse[]> {
    return await service.list(request);
  }

  @Get('/count')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a list of tournaments between two dates' })
  @ResponseSchema(Number)
  async count(@QueryParams() request: GetCalendarRequest): Promise<number> {
    return await service.count(request);
  }

  @Get('/match/:id')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a match of the tournament by its id' })
  @ResponseSchema(Calendar)
  async getByMatchId(@Param('id') id: string): Promise<Calendar | null> {
    return await service.getByMatchId(id);
  }

  @Get('/:id/draw')
  @HttpCode(200)
  @OpenAPI({ summary: 'The draw of this calendar' })
  @ResponseSchema('Record<MatchType, Record<PlayerCategory, IMatch[]>>')
  async getDraw(
    @Param('id') id: string
  ): Promise<Record<MatchType, Record<PlayerCategory, IMatch[]>> | undefined> {
    return await service.getDraw(id);
  }

  @Get('/:id/match/:type/:category/:number')
  @HttpCode(200)
  @OpenAPI({ summary: 'Returns a match by its number' })
  @ResponseSchema(ObjectId)
  async getByPosition(
    @Param('id') id: string,
    @Param('type') type: MatchType,
    @Param('category') category: PlayerCategory,
    @Param('number') number: number
  ): Promise<string> {
    return service.getByPosition(id, type, category, number);
  }

  @Post('')
  @HttpCode(201)
  @Authorized()
  @OpenAPI({ summary: 'Adds a tournament to the calendar' })
  @ResponseSchema(Calendar)
  async create(@Body() request: CalendarRequest): Promise<Calendar> {
    return await service.create(request);
  }

  @Put('/:id')
  @HttpCode(200)
  @Authorized()
  @OpenAPI({ summary: 'Updates an existing tournament in the calendar' })
  @ResponseSchema(Calendar)
  async update(
    @Body() request: CalendarRequest,
    @Param('id') id: string
  ): Promise<Calendar> {
    return await service.update(id, request);
  }

  @Put('/:id/draw')
  @HttpCode(200)
  @Authorized()
  @ResponseSchema(Calendar)
  @OpenAPI({ summary: 'Creates the match for the first round of every table' })
  async draw(@Param('id') id: string): Promise<Calendar> {
    return await service.drawMatches(id);
  }
}
