import { Request, Response } from 'express';
import { InvalidRequestError } from '../errors/InvalidRequestError';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
  HttpError,
  BadRequestError
} from 'routing-controllers';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: Error | HttpError | InvalidRequestError | BadRequestError,
    request: Request,
    response: Response,
    next: (
      err: Error | HttpError | InvalidRequestError | BadRequestError
    ) => Response
  ) {
    if (error instanceof BadRequestError) {
      const e = JSON.parse(JSON.stringify(error));
      if (e.errors)
        response.status(400).json(new InvalidRequestError(e.errors));
      else response.status(400).json(e.message);
    } else if (error instanceof InvalidRequestError) {
      response.status(400).json(new InvalidRequestError(error.errors));
    } else if (error.message.startsWith('Authorization is required')) {
      response.status(401).json('Unauthorized');
    } else if (error instanceof HttpError) {
      response.status(error.httpCode).json(error);
    }
    next(error);
  }
}
