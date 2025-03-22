import { Container } from 'typedi';
import { DistributedEvents } from './DistributedEvents';
import { Logger } from '@footy/fmk/libs/logger';
import { ClassType } from '@footy/fmk/libs/type';

export function onEvent(event: string) {
  return (target: any, propertyKey: string) => {
    EventsManager.addDistributedEventListener(event, {
      clazz: target.constructor,
      method: propertyKey,
    });
  };
}

export interface Registry {
  [event: string]: Array<DistributedEventListener>;
}

export type DistributedEventListener = {
  clazz: ClassType;
  method: string;
};

export class EventsManager {
  static readonly registry: Registry = {};

  private logger = Logger.getLogger(EventsManager);

  static addDistributedEventListener(event: string, listener: DistributedEventListener) {
    if (EventsManager.registry[event] === undefined) {
      EventsManager.registry[event] = [];
    }
    EventsManager.registry[event].push(listener);
  }

  static async start(de: DistributedEvents, listeners: ClassType[] = []) {
    de.on('RemoteEvent', (event, data) => {
      const regs = EventsManager.registry[event];
      if (regs) {
        return Promise.all(
          regs.map((reg) => {
            const claz = listeners.find((lis) => lis === reg.clazz);
            if (claz) {
              const instance = Container.get(claz);
              return instance[reg.method](data);
            }
          }),
        ).catch((e) => {
          console.log(e);
        });
      }
    });
    await de.sub(Object.keys(EventsManager.registry));
  }
}
