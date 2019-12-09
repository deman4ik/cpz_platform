import { Service, ServiceBroker, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";

class MarketsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_MARKETS,
      mixins: [Auth, DbService],
      adapter: SqlAdapter,
      dependencies: [cpz.Service.PUBLIC_CONNECTOR],
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
        add: {
          graphql: {
            mutation:
              "addMarket(exchange: String!, asset: String!, currency: String!): Response!"
          },
          params: { exchange: "string", asset: "string", currency: "string" },
          hooks: {
            before: "authAction"
          },
          handler: this.add
        }
      }
    });
  }

  async add(ctx: Context) {
    try {
      const market: cpz.Market = await this.broker.call(
        `${cpz.Service.PUBLIC_CONNECTOR}.getMarket`,
        ctx.params
      );

      await this.adapter.insert({ ...market, available: 5 });
      return { success: true, result: { ...market, available: 5 } };
    } catch (e) {
      this.logger.error(e);
      return { success: false, result: e };
    }
  }
}

export = MarketsService;
