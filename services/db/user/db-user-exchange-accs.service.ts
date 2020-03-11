import { Service, ServiceBroker, Context } from "moleculer";
import { Errors } from "moleculer-web";
import DbService from "moleculer-db";
import adapterOptions from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import { encrypt, capitalize } from "../../../utils";
import Auth from "../../../mixins/auth";
import SqlAdapter from "moleculer-db-adapter-sequelize";

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
      mixins: [Auth, DbService],
      adapter: new SqlAdapter(
        process.env.PG_DBNAME,
        process.env.PG_USER,
        process.env.PG_PWD,
        adapterOptions
      ),
      model: {
        name: "user_exchange_accs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userId: { type: Sequelize.UUID, field: "user_id" },
          exchange: { type: Sequelize.STRING },
          name: { type: Sequelize.STRING, allowNull: true },
          keys: { type: Sequelize.JSONB },
          status: { type: Sequelize.STRING },
          error: { type: Sequelize.STRING, allowNull: true },
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
          handler: this.changeName
        },
        invalidate: {
          params: {
            id: "string",
            error: "string"
          },
          handler: this.invalidate
        },
        delete: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "userExchangeAccDelete(id: ID!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.delete
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
      this.authAction(ctx);
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
            throw new Errors.ForbiddenError("FORBIDDEN", {
              userExAccId: existed.id
            });
          if (existed.exchange !== exchange)
            throw new Error("Invalid exchange");

          const startedUserRobots: cpz.UserRobotDB[] = await ctx.call(
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

      const check: {
        success: boolean;
        error?: string;
      } = await ctx.call(
        `${cpz.Service.PRIVATE_CONNECTOR_WORKER}.checkAPIKeys`,
        {
          exchange,
          key,
          secret,
          pass
        }
      );
      if (!check.success) return check;
      //TODO: offload encryption to worker thread
      const encryptedKeys: cpz.UserExchangeKeys = {
        key: await encrypt(userId, key),
        secret: await encrypt(userId, secret),
        pass: pass && (await encrypt(userId, pass))
      };

      if (!existed && (!name || name === "")) {
        const [sameExchange] = await this.adapter.find({
          fields: ["name"],
          limit: 1,
          sort: "-created_at",
          query: {
            exchange
          }
        });
        const number =
          (sameExchange &&
            sameExchange.name &&
            +sameExchange.name.split("#")[1]) ||
          0;

        name = `${capitalize(exchange)} #${number + 1}`;
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
        name = name || existed.name;
        await this.adapter.updateById(id, {
          $set: {
            name,
            keys: exchangeAcc.keys,
            status: exchangeAcc.status,
            error: null
          }
        });
      } else {
        await this.adapter.insert(exchangeAcc);
      }
      return { success: true, result: name };
    } catch (err) {
      this.logger.error(err);
      return {
        success: false,
        error: err.message
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
      this.authAction(ctx);
      let { id, name } = ctx.params;
      const { id: userId } = ctx.meta.user;

      let userExchangeAcc: cpz.UserExchangeAccount = await this.adapter.findById(
        id
      );
      if (!userExchangeAcc)
        throw new Errors.NotFoundError("User Exchange Account not found", {
          id
        });
      if (userExchangeAcc.userId !== userId)
        throw new Errors.ForbiddenError("FORBIDDEN", {
          userExAccId: userExchangeAcc.id
        });

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

  async invalidate(ctx: Context<{ id: string; error: string }>) {
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
        await ctx.emit<cpz.UserExchangeAccountErrorEvent>(
          cpz.Event.USER_EX_ACC_ERROR,
          {
            id,
            userId: userExchangeAcc.userId,
            name: userExchangeAcc.name,
            exchange: userExchangeAcc.exchange,
            error: error
          }
        );
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async delete(
    ctx: Context<
      {
        id: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);
      let { id } = ctx.params;
      const { id: userId } = ctx.meta.user;

      let existed: cpz.UserExchangeAccount;
      if (id) {
        existed = await this.adapter.findById(id);
        if (existed) {
          if (existed.userId !== userId)
            throw new Errors.ForbiddenError("FORBIDDEN", {
              userExAccId: existed.id
            });

          const userRobots: cpz.UserRobotDB[] = await ctx.call(
            `${cpz.Service.DB_USER_ROBOTS}.find`,
            {
              query: {
                userExAccId: existed.id
              }
            }
          );

          if (
            existed.status !== cpz.UserExchangeAccStatus.disabled &&
            userRobots.length > 0
          )
            throw new Error("Can't delete API Keys with with existed Robots");

          await this._remove(ctx, { id });
        }
      }

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

export = UserExchangeAccsService;
