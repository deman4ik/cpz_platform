import redis from "ioredis";

//TODO: Refactoring, NPM module
class RedisSession {
  options: any;
  client: any;
  constructor(options: any) {
    this.options = Object.assign(
      {
        property: "session",
        getSessionKey: (ctx: any) =>
          ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
        store: {}
      },
      options
    );

    this.client = new redis(this.options.store);
  }

  getSession(key: string) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err: any, json: any) => {
        if (err) {
          return reject(err);
        }
        if (json) {
          try {
            const session = JSON.parse(json);

            resolve(session);
          } catch (error) {
            console.error(error);
          }
        }
        resolve({});
      });
    });
  }

  clearSession(key: any) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err: any, json: any) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  saveSession(key: any, session: any) {
    if (!session || Object.keys(session).length === 0) {
      return this.clearSession(key);
    }

    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(session), (err: any, json: any) => {
        if (err) {
          return reject(err);
        }
        if (this.options.ttl) {
          this.client.expire(key, this.options.ttl);
        }
        resolve({});
      });
    });
  }

  middleware() {
    return (ctx: any, next: any) => {
      const key = this.options.getSessionKey(ctx);
      if (!key) {
        return next();
      }
      return this.getSession(key).then(session => {
        Object.defineProperty(ctx, this.options.property, {
          get: function() {
            return session;
          },
          set: function(newValue) {
            session = Object.assign({}, newValue);
          }
        });
        return next().then(() => this.saveSession(key, session));
      });
    };
  }
}

export = RedisSession;
