import 'reflect-metadata';
import { authorizationChecker } from './middlewares/authentication';
import { config } from './config/config';

module.exports = {
  authorizationChecker,
  config
};
