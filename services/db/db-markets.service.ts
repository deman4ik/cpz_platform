import { Service, ServiceBroker, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";
import RedisLock from "../../mixins/redislock";
import cron from "node-cron";

class MarketsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_MARKETS,
      mixins: [Auth, DbService, RedisLock()],
      adapter: SqlAdapter,
      model: {
        name: "markets",
        define: {
          exchange: { type: Sequelize.STRING, primaryKey: true },
          asset: { type: Sequelize.STRING, primaryKey: true },
          currency: { type: Sequelize.STRING, primaryKey: true },
          precision: { type: Sequelize.JSONB },
          limits: { type: Sequelize.JSONB },
          available: Sequelize.NUMBER,
          loadFrom: { type: Sequelize.STRING, field: "load_from" }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        upsert: {
          graphql: {
            mutation:
              "upsertMarket(exchange: String!, asset: String!, currency: String!): Response!"
          },
          params: { exchange: "string", asset: "string", currency: "string" },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          handler: this.upsert
        }
      },
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  cronTask: cron.ScheduledTask = cron.schedule(
    "12 0 0 * * *",
    this.updateMarkets.bind(this),
    {
      scheduled: false
    }
  );

  async startedService() {
    this.cronTask.start();
  }

  async stoppedService() {
    this.cronTask.stop();
  }

  async updateMarkets() {
    try {
      this.logger.info("Updating Markets");
      const lock = await this.createLock();
      await lock.acquire(cpz.cronLock.MARKETS_UPDATE);
      let timerId = setTimeout(async function tick() {
        await lock.extend(10000);
        timerId = setTimeout(tick, 9000);
      }, 19000);

      try {
        const markets: cpz.Market[] = await this.adapter.find({
          query: {
            available: { $gte: 5 }
          }
        });
        for (const { exchange, asset, currency } of markets) {
          this.logger.info(`Updating Market ${exchange} ${asset}/${currency}`);
          await this.actions.upsert({ exchange, asset, currency });
        }
      } catch (e) {
        this.logger.error(e);
      }

      clearInterval(timerId);
      await lock.release();
      this.logger.info("Markets updated!");
    } catch (e) {
      if (e instanceof this.LockAcquisitionError) return;
      this.logger.error(e);
    }
  }

  async upsert(
    ctx: Context<{
      exchange: string;
      asset: string;
      currency: string;
    }>
  ) {
    try {
      const market = await ctx.call<
        cpz.Market,
        {
          exchange: string;
          asset: string;
          currency: string;
        }
      >(`${cpz.Service.PUBLIC_CONNECTOR}.getMarket`, ctx.params);

      const [exists] = await this.adapter.find({
        query: ctx.params
      });
      let result;
      if (exists) {
        result = { ...exists, ...market };
        await this.adapter.updateMany(ctx.params, result);
      } else {
        result = { ...market, available: 5 };
        await this.adapter.insert(result);
      }
      return { success: true, result };
    } catch (e) {
      this.logger.error(e);
      return { success: false, result: e };
    }
  }
}

export = MarketsService;
