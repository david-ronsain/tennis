/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

import { Service } from 'typedi';
import { validateSync } from 'class-validator';
import { CalendarRepository } from '../repositories/calendarRepository';
import { HttpError } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { drawMatches, prepareFilters, updateCalendar } from '../helpers/helper';
import { Calendar } from '../entities/calendarEntity';
import { InvalidRequestError } from 'core/errors';
import { CalendarRequest, GetCalendarRequest } from 'core/requests';
import axios from 'axios';
import { config } from 'core/config/config';
import { MatchType, PlayerCategory } from 'core/enums';
import { IMatch, ITournament } from 'core/interfaces';
import { CalendarResponse } from 'core/responses';

@Service()
export class CalendarService {
  /**
   * Returns the list of all calendars filtered and paginated
   * @param request Informations about the calendar to find
   * @returns
   */
  async list(request: GetCalendarRequest): Promise<CalendarResponse[]> {
    const filters = prepareFilters(request);

    return await (
      await CalendarRepository
    ).getList(
      filters.$and.length ? filters : {},
      request.skip ?? 0,
      request.results ?? 10
    );
  }
  /**
   * Returns the number of all calendars filtered and paginated
   * @param request Informations about the calendar to find
   * @returns
   */
  async count(request: GetCalendarRequest): Promise<number> {
    const filters = prepareFilters(request);

    return await (
      await CalendarRepository
    ).count(filters.$and.length ? filters : {});
  }

  /**
   *
   * @param matchId Returns a calendar by a match ID
   * @returns
   */
  async getByMatchId(matchId: string): Promise<Calendar | null> {
    const calendarSAtp = await (
      await CalendarRepository
    ).findOneBy({ 'draw.SINGLES.ATP': new ObjectId(matchId) });
    const calendarDAtp = await (
      await CalendarRepository
    ).findOneBy({ 'draw.DOUBLES.ATP': new ObjectId(matchId) });
    const calendarSWta = await (
      await CalendarRepository
    ).findOneBy({ 'draw.SINGLES.WTA': new ObjectId(matchId) });
    const calendarDWta = await (
      await CalendarRepository
    ).findOneBy({ 'draw.DOUBLES.WTA': new ObjectId(matchId) });
    if (!calendarSAtp && !calendarDAtp && !calendarSWta && !calendarDWta) {
      throw new HttpError(404, 'calendar not found');
    }

    const cal = calendarSAtp ?? calendarDAtp ?? calendarSWta ?? calendarDWta;

    return JSON.parse(JSON.stringify(cal)) as Calendar;
  }

  /**
   * Adds a tournament to the calendar
   * @param request the informations about the tournament to add
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async create(request: CalendarRequest): Promise<Calendar> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const calendar = new Calendar(request);
    return (await CalendarRepository)
      .insertOne(calendar)
      .then(() => calendar)
      .catch((err: string | undefined) => {
        throw new HttpError(400, err);
      });
  }

  /**
   * Updates an existing tournament on the calendar
   * @param id The id of the tournament to update
   * @param request the informations about the tournament to update
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async update(id: string, request: CalendarRequest): Promise<Calendar> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const calendar = await (
      await CalendarRepository
    ).findOne({
      where: {
        _id: new ObjectId(id.toString())
      }
    });

    if (!calendar) {
      throw new HttpError(404, 'tournament not found');
    }

    updateCalendar(calendar, request);

    return (await CalendarRepository)
      .update(id.toString(), calendar)
      .then(() => calendar as Calendar)
      .catch(() => {
        throw new HttpError(400, 'not updated');
      });
  }

  /**
   * Creates the match for the first round of every table
   * @param id ID of the tournament to update in the calendar
   * @throws HttpError
   * @returns
   */
  async drawMatches(id: string): Promise<Calendar> {
    const calendar = await (
      await CalendarRepository
    ).findOneBy({ _id: new ObjectId(id.toString()) });
    if (!calendar) {
      throw new HttpError(404, 'calendar not found');
    } else if (calendar.draw) {
      throw new HttpError(401, 'already drawn');
    }

    const tournament = await axios
      .get(config.TOURNAMENTS_API.URL + calendar.tournament.toString())
      .then((res: { data: ITournament }) => res.data);
    if (tournament._id.toString() === '') {
      throw new HttpError(404, 'tournament not found');
    }

    calendar.draw = await drawMatches(
      tournament.category,
      calendar._id.toString()
    );

    if (typeof calendar.tournament === 'string') {
      calendar.tournament = new ObjectId(calendar.tournament);
    }

    return await (
      await CalendarRepository
    )
      .save(calendar)
      .then(() => calendar as Calendar)
      .catch(() => calendar as Calendar);
  }

  /**
   * Returns a match id by its type, category and position
   * @param id Calendar ID
   * @param type Match type (singles or doubles)
   * @param category Player category (ATP or WTA)
   * @param number Match position in the list
   * @returns
   */
  async getByPosition(
    id: string,
    type: MatchType,
    category: PlayerCategory,
    number: number
  ): Promise<string> {
    const calendar = await (
      await CalendarRepository
    ).findOne({ where: { _id: new ObjectId(id) } });
    if (!calendar) {
      throw new HttpError(404, 'calendar not found');
    }

    if (calendar.draw) {
      const typeIndex = Object.keys(calendar.draw).findIndex((k) => k === type);
      const valuesByTypeIndex = Object.values(calendar.draw)[typeIndex];
      const categoryIndex = Object.keys(valuesByTypeIndex).findIndex(
        (k) => k === category
      );
      const valuesByCategoryIndex =
        Object.values(valuesByTypeIndex)[categoryIndex];

      if (number < valuesByCategoryIndex.length) {
        return valuesByCategoryIndex[number].toString();
      }
    }

    throw new HttpError(404, 'match not found');
  }

  /**
   * Returns the draw for a calendar
   * @param id Calendar ID
   * @throws HttpError
   * @returns
   */
  async getDraw(
    id: string
  ): Promise<Record<MatchType, Record<PlayerCategory, IMatch[]>> | undefined> {
    const calendar = await (
      await CalendarRepository
    ).findOne({ where: { _id: new ObjectId(id) } });
    if (!calendar) {
      throw new HttpError(404, 'calendar not found');
    }
    if (!calendar.draw) {
      throw new HttpError(404, 'draw not found');
    }

    const draw = await (await CalendarRepository).getDraw(id);

    return draw;
  }
}
