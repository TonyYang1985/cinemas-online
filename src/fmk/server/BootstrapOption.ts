import { DistributedEventsLoaderOption, KoaLoaderOption, RedisLoaderOption, TypeormLoaderOption } from '@footy/fmk/libs';
import { BootstrapLoader } from './BootstrapLoader';

export type BootstrapOption = KoaLoaderOption &
  TypeormLoaderOption &
  RedisLoaderOption &
  DistributedEventsLoaderOption & {
    disableRedis?: boolean;
    disableDatabase?: boolean;
    disableEvent?: boolean;
    loaders?: BootstrapLoader[];
  };
