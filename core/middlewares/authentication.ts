import { config } from '../config/config';
import { Action } from 'routing-controllers';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export function authorizationChecker(action: Action): boolean {
  const token =
    (action.request as Request).headers.authorization
      ?.toString()
      ?.substring(7) ?? '';
  try {
    const decoded = jwt.verify(token, config.CORE.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: config.CORE.JWT_VALIDITY
    });

    return (
      decoded instanceof Object &&
      decoded.login === config.CORE.MASTER_LOGIN &&
      decoded.password === config.CORE.MASTER_PASSWORD
    );
  } catch (err: unknown) {
    return false;
  }
}
