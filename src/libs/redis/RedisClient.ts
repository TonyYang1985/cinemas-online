import Redis from 'ioredis';
import _ from 'lodash';
import { Logger } from '../logger';

export class RedisClient {
    private logger = Logger.getLogger(RedisClient);
    public readonly redis: Redis;
    constructor(public readonly redisCfg: string | any) {
        this.redis = this.newClient();
    }

    newClient() {
        return new Redis(this.redisCfg);
    }

    async saveCounter(counterName: string, counter: Record<string, number>, overwrite = false) {
        if (overwrite) {
            await this.redis.hset(counterName, counter);
        } else {
            const pl = this.redis.multi();
            Object.keys(counter).forEach((field) => {
                const value = counter[field];
                if (!_.isNil(value)) {
                    pl.hsetnx(counterName, field, value);
                }
            });
            await pl.exec();
        }
    }

    async increaseCounter(counterName: string, name: string, step = 1) {
        return this.redis.hincrby(counterName, name, step);
    }

    async decreaseCounter(counterName: string, name: string, step = 1) {
        return this.redis.hincrby(counterName, name, 0 - step);
    }

    async removeCounter(counterName: string, name: string | string[]) {
        if (typeof name === 'string') {
            return this.redis.hdel(counterName, name);
        } else {
            const pl = this.redis.multi();
            name.forEach((n) => pl.hdel(counterName, n));
            return pl.exec();
        }
    }

    async getCounterKeys(counterName: string) {
        return this.redis.hkeys(counterName);
    }

    async getCounterValues(counterName: string, name: string | string[]) {
        if (typeof name === 'string') {
            return this.redis.hget(counterName, name);
        } else {
            return this.redis.hmget(counterName, ...name);
        }
    }
}