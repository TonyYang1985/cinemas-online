import { MicroframeworkSettings } from 'microframework';
import { Container } from 'typedi';
import { Logger } from '@footy/fmk/libs/logger';
import { ClassType } from '@footy/fmk/libs/type';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { EventsManager } from './EventsManager';
import { DistributedEvents, RabbitMQConfig } from './DistributedEvents';

export type DistributedEventsLoaderOption = {
  eventsHandlers?: ClassType[];
};
export const rabbitmqLoader = (option: DistributedEventsLoaderOption) => (settings?: MicroframeworkSettings) => {
  const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
  const rabbitmqCfg = ConfigManager.getConfig<RabbitMQConfig>('rabbitmq');
  return DistributedEvents.open(rabbitmqCfg, appCfg.appName).then((events) => {
    Container.set(DistributedEvents, events);
    settings?.onShutdown(async () => events.close());
    return EventsManager.start(events, option.eventsHandlers).then(() => {
      Logger.getLogger('RabbitmqLoader').info(`🔗RabbitMQ connected.`);
    });
  });
};
