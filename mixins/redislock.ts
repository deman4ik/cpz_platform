import { ServiceSchema } from "moleculer";
import Redis from "ioredis";
import Redlock from "redlock";

export = function createService(options?: Redis.RedisOptions): ServiceSchema {
  return {
    name: "",
    created() {
      this.LockError = Redlock.LockError;
      this.redisClient = new Redis(
        options || {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          tls: process.env.REDIS_TLS && {}
        }
      );
    },
    methods: {
      async createLock(
        resource: string,
        timeout?: number,
        retries?: number,
        delay?: number
      ) {
        const lockTimeout = timeout || 20000;
        const redlock = new Redlock(
          // you should have one client for each independent redis node
          // or cluster
          [new Redis()],
          {
            // the expected clock drift; for more details
            // see http://redis.io/topics/distlock
            driftFactor: 0.01, // time in ms

            // the max number of times Redlock will attempt
            // to lock a resource before erroring
            retryCount: retries || 3,

            // the time in ms between attempts
            retryDelay: delay || lockTimeout / 2, // time in ms

            // the max time in ms randomly added to retries
            // to improve performance under high contention
            // see https://www.awsarchitectureblog.com/2015/03/backoff.html
            retryJitter: 200 // time in ms
          }
        );

        return redlock.lock(resource, lockTimeout);
      }
    }
  };
};
