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
        return lock.createLock(this.redisClient, {
          timeout: timeout || 20000,
          retries: retries || 0,
          delay: delay || 0
        });
      }
    }
  };
};
