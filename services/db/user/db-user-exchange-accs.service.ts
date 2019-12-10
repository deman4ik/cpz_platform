import { Service, ServiceBroker, Context, Errors } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import { encrypt, capitalize } from "../../../utils";

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
          error: { type: Sequelize.JSONB },
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
        },
        changeName: {
          params: {
            id: "string",
            name: "string"
          },
          graphql: {
            mutation:
              "userExchangeAccChangeName(id: ID!, name: String!): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.changeName
        },
        invalidate: {
          params: {
            id: "string",
            error: "object"
          },
          handler: this.invalidate
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
      let {
        id,
        exchange,
        name,
        keys: { key, secret, pass }
      } = ctx.params;
      const { id: userId } = ctx.meta.user;

      let existed: cpz.UserExchangeAccount;
      if (id) {
        existed = await this.adapter.findById(id);
        if (existed) {
          if (existed.userId !== userId)
            throw new Errors.MoleculerClientError("FORBIDDEN", 403);
          if (existed.exchange !== exchange)
            throw new Error("Invalid exchange");

          const startedUserRobots: cpz.UserRobotDB[] = await this.broker.call(
            `${cpz.Service.DB_USER_ROBOTS}.find`,
            {
              query: {
                userExAccId: existed.id,
                status: cpz.Status.started
              }
            }
          );

          if (
            existed.status !== cpz.UserExchangeAccStatus.disabled &&
            startedUserRobots.length > 0
          )
            throw new Error(
              "Failed to change User Exchange Account with started Robots"
            );
        }
      }

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

      if (!existed && (!name || name === "")) {
        const exchangeAccsCount: number = await this._count(ctx, {
          query: {
            exchange,
            userId
          }
        });

        name = `${capitalize(exchange)} #${exchangeAccsCount + 1}`;
      }

      const exchangeAcc: cpz.UserExchangeAccount = {
        id: id || uuid(),
        userId,
        exchange,
        name,
        keys: encryptedKeys,
        status: cpz.UserExchangeAccStatus.enabled,
        error: null,
        ordersCache: {}
      };

      if (existed) {
        await this.adapter.updateById(id, {
          $set: {
            name: name || existed.name,
            keys: exchangeAcc.keys,
            status: exchangeAcc.status,
            error: null
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

  async changeName(
    ctx: Context<
      {
        id: string;
        name: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      let { id, name } = ctx.params;
      const { id: userId } = ctx.meta.user;

      let userExchangeAcc: cpz.UserExchangeAccount = await this.adapter.findById(
        id
      );
      if (!userExchangeAcc)
        throw new Errors.MoleculerClientError(
          "User Exchange Account not found",
          404,
          "ERR_NOT_FOUND",
          { id }
        );
      if (userExchangeAcc.userId !== userId)
        throw new Errors.MoleculerClientError("FORBIDDEN", 403);

      await this.adapter.updateById(id, {
        $set: {
          name
        }
      });
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  async invalidate(ctx: Context<{ id: string; error: any }>) {
    try {
      const { id, error } = ctx.params;
      const userExchangeAcc: cpz.UserExchangeAccount = await this.adapter.getById(
        id
      );
      if (userExchangeAcc) {
        await this.adapter.updateById(id, {
          $set: {
            status: cpz.UserExchangeAccStatus.invalid,
            error
          }
        });
        await this.broker.emit<cpz.UserExchangeAccountErrorEvent>(
          cpz.Event.USER_EX_ACC_ERROR,
          {
            id,
            name: userExchangeAcc.name,
            exchange: userExchangeAcc.exchange,
            errorMessage: error.message
          }
        );
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserExchangeAccsService;
