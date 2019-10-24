import { Service, ServiceBroker, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import { encrypt } from "../../../utils/crypto";

class UserExchangeAccsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_EXCHANGE_ACCS,
      settings: {
        graphql: {
          type: `
          input ExchangeKeys {
            key: String!
            secret: String!
            pass: String
          }
          `
        }
      },
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_exchange_accs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userId: { type: Sequelize.UUID, field: "user_id" },
          exchange: { type: Sequelize.STRING },
          name: { type: Sequelize.STRING, allowNull: true },
          keys: { type: Sequelize.JSONB },
          status: { type: Sequelize.STRING },
          ordersCache: { type: Sequelize.JSONB, field: "orders_cache" }
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
            id: { type: "string", optional: true },
            exchange: "string",
            name: { type: "string", optional: true },
            keys: { type: "object" }
          },
          graphql: {
            mutation:
              "userExchangeAccUpsert(id: ID, exchange: String!, name: String, keys:ExchangeKeys!): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(
    ctx: Context<
      {
        id?: string;
        exchange: string;
        name?: string;
        keys: { key: string; secret: string; pass?: string };
      },
      { user: cpz.User }
    >
  ) {
    try {
      const {
        id,
        exchange,
        name,
        keys: { key, secret, pass }
      } = ctx.params;
      const { id: userId } = ctx.meta.user;

      await this.broker.call(
        `${cpz.Service.PRIVATE_CONNECTOR_WORKER}.checkAPIKeys`,
        {
          exchange,
          key,
          secret,
          pass
        }
      );

      const encryptedKeys: cpz.UserExchangeKeys = {
        key: await encrypt(userId, key),
        secret: await encrypt(userId, secret),
        pass: pass && (await encrypt(userId, pass))
      };
      const exchangeAcc: cpz.UserExchangeAccount = {
        id: id || uuid(),
        userId,
        exchange,
        name,
        keys: encryptedKeys,
        status: cpz.UserExchangeAccStatus.enabled,
        ordersCache: {}
      };
      if (id) {
        const existed = await this.adapter.findById(id);
        if (existed.userId !== userId)
          throw new Error("Invalid exchange account user");
        await this.adapter.updateById(id, {
          $set: {
            exchange: exchangeAcc.exchange,
            keys: exchangeAcc.keys,
            status: exchangeAcc.status
          }
        });
      } else {
        await this.adapter.insert(exchangeAcc);
      }
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      return {
        success: false,
        error: err
      };
    }
  }
}

export = UserExchangeAccsService;
