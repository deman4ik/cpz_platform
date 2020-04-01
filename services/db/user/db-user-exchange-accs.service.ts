import { Service, ServiceBroker, Context } from "moleculer";
import { Errors } from "moleculer-web";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import { encrypt, formatExchange } from "../../../utils";
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
      adapter,
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
            name: { type: "string", empty: false, trim: true, optional: true },
            keys: {
              type: "object",
              props: {
                key: { type: "string", empty: false, trim: true },
                secret: { type: "string", empty: false, trim: true },
                pass: {
                  type: "string",
                  optional: true,
                  empty: false,
                  trim: true
                }
              }
            }
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
            name: { type: "string", empty: false, trim: true }
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
        existed = await this.actions.get({ id }, { parentCtx: ctx });
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
            existed.status === cpz.UserExchangeAccStatus.enabled &&
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

      if (!existed) {
        if (!name || name === "") {
          const [sameExchange] = await this.actions.find(
            {
              fields: ["name"],
              limit: 1,
              sort: "-created_at",
              query: {
                exchange
              }
            },
            { parentCtx: ctx }
          );
          const number =
            (sameExchange &&
              sameExchange.name &&
              +sameExchange.name.split("#")[1]) ||
            0;

          name = `${formatExchange(exchange)} #${number + 1}`;
        } else {
          const [existsWithName] = await this.actions.find(
            {
              fields: ["id"],
              limit: 1,
              query: {
                name
              }
            },
            { parentCtx: ctx }
          );
          if (existsWithName)
            throw new Error(
              `User Exchange Account already exists with name "${name}". Please try with another name.`
            );
        }
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
      this.logger.warn(err);
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

      let userExchangeAcc: cpz.UserExchangeAccount = await this.actions.get(
        { id },
        { parentCtx: ctx }
      );
      if (!userExchangeAcc)
        throw new Errors.NotFoundError("User Exchange Account not found", {
          id
        });
      if (userExchangeAcc.userId !== userId)
        throw new Errors.ForbiddenError("FORBIDDEN", {
          userExAccId: userExchangeAcc.id
        });

      const [existsWithName] = await this.actions.find({
        fields: ["id"],
        limit: 1,
        query: {
          name,
          id: { $ne: id }
        }
      });
      if (existsWithName)
        throw new Error(
          `User Exchange Account already exists with name "${name}". Please try with another name.`
        );

      await this.adapter.updateById(id, {
        $set: {
          name
        }
      });
      return { success: true };
    } catch (err) {
      this.logger.warn(err);
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
        existed = await this.actions.get({ id }, { parentCtx: ctx });
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
            existed.status === cpz.UserExchangeAccStatus.enabled &&
            userRobots.length > 0
          )
            throw new Error("You can't delete API Keys with added Robots");

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
