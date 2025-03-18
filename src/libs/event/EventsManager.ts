import { Container } from 'typedi';
import { DistributedEvents } from '@footy/fmk/libs/event/DistributedEvents';
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

  static start(events: DistributedEvents, handlers?: ClassType[]) {
    if (handlers) {
      handlers.forEach((handler) => {
        Container.get(handler);
      });
    }

    const registry = EventsManager.registry;
    for (const event in registry) {
      if (Object.prototype.hasOwnProperty.call(registry, event)) {
        const listeners = registry[event];
        events.on(event, (data: unknown) => {
          listeners.forEach((listener) => {
            const instance = Container.get(listener.clazz);
            instance[listener.method](data);
          });
        });
      }
    }
    return Promise.resolve();
  }
}
