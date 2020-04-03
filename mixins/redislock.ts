import { ServiceSchema } from "moleculer";
import Redis from "ioredis";
import lock from "ioredis-lock";

export = function createService(options?: Redis.RedisOptions): ServiceSchema {
  return {
    name: "",
    created() {
      this.LockAcquisitionError = lock.LockAcquisitionError;
      this.LockReleaseError = lock.LockReleaseError;
      this.LockExtendError = lock.LockExtendError;
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
      async createLock(timeout?: number, retries?: number, delay?: number) {
        const lockTimeout = timeout || 20000;
        return lock.createLock(this.redisClient, {
          timeout: lockTimeout,
          retries: retries || 3,
          delay: delay || lockTimeout / 2
        });
      }
    }
  };
};
