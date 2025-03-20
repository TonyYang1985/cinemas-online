import 'reflect-metadata';
import { ApiRegisterController, bootstrap } from '@footy/fmk';
import * as rsControllers from '@footy/controllers';
import * as wsControllers from '@footy/wsControllers';
import * as Entities from '@footy/entities';
import * as Handlers from '@footy/events';

bootstrap({
  restfulControllers: [...Object.values(rsControllers), ApiRegisterController],
  wsControllers: Object.values(wsControllers),
  entities: Object.values(Entities),
  eventsHandlers: Object.values(Handlers),
})
  .catch((e) => {
    console.error(e);
  process.exit(-1);
  });
