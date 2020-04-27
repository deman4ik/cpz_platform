import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class UserAggrStatsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_AGGR_STATS,
      mixins: [DbService],
      adapter,
      model: {
        name: "user_aggr_stats",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userId: { type: Sequelize.UUID, field: "user_id" },
          exchange: { type: Sequelize.STRING, allowNull: true },
          asset: { type: Sequelize.STRING, allowNull: true },
          type: Sequelize.STRING,
          statistics: { type: Sequelize.JSONB, allowNull: true },
          equity: { type: Sequelize.JSONB, allowNull: true }
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
          params: {
            userId: "string",
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            type: { type: "string", enum: ["signal", "userRobot"] },
            statistics: "object",
            equity: "object"
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context<cpz.UserAggrStatsDB>) {
    try {
      const {
        userId,
        exchange,
        asset,
        type,
        statistics,
        equity
      }: cpz.UserAggrStatsDB = ctx.params;
      const value = Object.values({
        userId,
        exchange,
        asset,
        type,
        statistics,
        equity
      });
      const query = `INSERT INTO user_aggr_stats
      (  
        user_id,
        exchange,
        asset,
        type,
        statistics,
        equity
         ) 
         VALUES (?)
          ON CONFLICT ON CONSTRAINT user_aggr_stats_user_id_exchange_asset_type_key 
          DO UPDATE SET updated_at = now(),
          statistics = excluded.statistics,
          equity = excluded.equity`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: [value]
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserAggrStatsService;
