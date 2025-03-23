import crypto from 'crypto';
import EventEmitter from 'eventemitter3';
import Redis from 'ioredis';
import { Service } from 'typedi';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { id as generateId } from '@footy/fmk/libs/generator';
import { Logger } from '@footy/fmk/libs/logger';
import { RedisClient } from '@footy/fmk/libs/redis';
import { LeaderOptions } from './LeaderOptions';

// Make the key less prone to collision
const hashKey = function (key: string) {
  const { appName } = ConfigManager.getConfig<ApplicationConfig>('application');
  const keyStr = `LeaderLock.${appName}.${key}`;
  return crypto.createHash('sha1').update(keyStr).digest('hex');
};

class LeaderOption {
  ttl = 10000;

  wait = 1000;

  _key = 'default';

  constructor(private leader: Leader) {}

  get project() {
    return this._key;
  }

  set project(key: string) {
    this._key = key;
    this.leader.key = hashKey(key);
  }
}

export const LeaderEvents = {
  elected: 'elected',
  revoked: 'revoked',
  error: 'error',
};

@Service()
export class Leader extends EventEmitter {
  logger = Logger.getLogger(Leader);

  readonly id = generateId(16);

  readonly redis: Redis;

  key: string;

  options = new LeaderOption(this);

  private renewId: NodeJS.Timeout;

  private electId: NodeJS.Timeout;

  constructor(redisClient: RedisClient) {
    super();
    this.redis = redisClient.newClient();

    this.on(LeaderEvents.elected, () => {
      this.logger.info(`🚀Current service is elected as ${this.options.project}'s leader now.`);
    });
    this.on(LeaderEvents.error, (e) => {
      this.logger.error(e);
    });
  }

  config(options: LeaderOptions) {
    Object.assign(this.options, options);
    return this;
  }

  async isLeader() {
    try {
      const id = await this.redis.get(this.key);
      return id === this.id;
    } catch (error) {
      this.emit(LeaderEvents.error, error);
      return false;
    }
  }

  async renew() {
    try {
      // it is safer to check we are still leader
      const isLeader = await this.isLeader();
      if (isLeader) {
        await this.redis.pexpire(this.key, this.options.ttl);
      } else {
        clearInterval(this.renewId);
        this.electId = setTimeout(() => this.elect(), this.options.wait);
        this.emit(LeaderEvents.revoked);
      }
    } catch (error) {
      this.emit(LeaderEvents.error, error);
    }
  }

  async elect() {
    try {
      // atomic redis set
      const res = await this.redis.set(this.key, this.id, 'PX', this.options.ttl, 'NX');
      if (res !== null) {
        this.emit(LeaderEvents.elected);
        this.renewId = setInterval(() => this.renew(), this.options.ttl / 2);
      } else {
        // use setTimeout to avoid max call stack error
        this.electId = setTimeout(() => this.elect(), this.options.wait);
      }
    } catch (error) {
      this.emit(LeaderEvents.error, error);
    }
  }

  async stop() {
    try {
      const isLeader = await this.isLeader();
      if (isLeader) {
        // possible race condition, cause we need atomicity on get -> isEqual -> delete
        await this.redis.del(this.key);
        this.emit(LeaderEvents.revoked);
      }
      clearInterval(this.renewId);
      clearTimeout(this.electId);
    } catch (error) {
      this.emit(LeaderEvents.error, error);
    }
  }
}
