import { default as Application, default as Koa } from 'koa';
import { AuthorizationChecker } from 'routing-controllers/types/AuthorizationChecker';
import { CurrentUserChecker } from 'routing-controllers/types/CurrentUserChecker';
import { ClassType } from '@footy/fmk/libs/type';
import _ from 'lodash';

export interface KoaLoaderOption {
  restfulControllers?: ClassType[];
  wsControllers?: ClassType[];
  authorizationChecker?: AuthorizationChecker;
  currentUserChecker?: CurrentUserChecker;
  use?: Application.Middleware[];
  noListening?: boolean;
}

export const KoaHolder: { koa?: Koa } = {};
