import {
  Service,
  ServiceBroker,
  Context,
  Errors as ErrorsBase
} from "moleculer";
import { Errors } from "moleculer-web";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import {
  underscoreToCamelCaseKeys,
  getAccessValue,
  datesToISOString
} from "../../../utils";
import Auth from "../../../mixins/auth";

class UserRobotsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ROBOTS,
      settings: {
        graphql: {
          type: `
          input UserRobotSettings {
            volume: Float!,
            kraken: JSON
          }
          `
        }
      },
      mixins: [Auth, DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_robots",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userExAccId: { type: Sequelize.UUID, field: "user_ex_acc_id" },
          userId: { type: Sequelize.UUID, field: "user_id" },
          robotId: { type: Sequelize.UUID, field: "robot_id" },
          settings: Sequelize.JSONB,
          internalState: {
            type: Sequelize.JSONB,
            field: "internal_state"
          },
          status: Sequelize.STRING,
          startedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "started_at",
            get: function() {
              const value = this.getDataValue("startedAt");
              return (value && value.toISOString()) || value;
            }
          },
          stoppedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "stopped_at",
            get: function() {
              const value = this.getDataValue("stoppedAt");
              return (value && value.toISOString()) || value;
            }
          },
          statistics: { type: Sequelize.JSONB, allowNull: true },
          equity: { type: Sequelize.JSONB, allowNull: true },
          message: { type: Sequelize.STRING, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        create: {
          params: {
            userExAccId: "string",
            robotId: "string",
            settings: {
              type: "object",
              props: {
                volume: { type: "number", positive: true },
                kraken: {
                  type: "object",
                  optional: true,
                  props: {
                    leverage: {
                      type: "number",
                      enum: [2, 3, 4, 5],
                      optional: true
                    }
                  }
                }
              }
            }
          },
          graphql: {
            mutation:
              "userRobotCreate(userExAccId: String!, robotId: String!, settings: UserRobotSettings!): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.create
        },
        delete: {
          params: {
            id: "string"
          },
          graphql: {
            mutation: "userRobotDelete(id: String!): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.delete
        },
        edit: {
          params: {
            id: "string",
            settings: {
              type: "object",
              props: {
                volume: { type: "number", positive: true },
                kraken: {
                  type: "object",
                  optional: true,
                  props: {
                    leverage: {
                      type: "number",
                      enum: [2, 3, 4, 5],
                      optional: true
                    }
                  }
                }
              }
            }
          },
          graphql: {
            mutation:
              "userRobotEdit(id: String!, settings: UserRobotSettings!): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.edit
        },
        getRobots: {
          params: {
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            currency: { type: "string", optional: true },
            userId: { type: "string", optional: true }
          },
          handler: this.getRobots
        },
        getState: {
          params: {
            id: "string"
          },
          handler: this.getState
        },
        getUserRobot: {
          params: {
            robotId: "string"
          },
          handler: this.getUserRobot
        },
        getUserRobotEventInfo: {
          params: {
            id: "string"
          },
          handler: this.getUserRobotEventInfo
        }
      }
    });
  }

  async create(
    ctx: Context<
      {
        userExAccId: string;
        robotId: string;
        settings: cpz.UserRobotSettings;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { userExAccId, robotId, settings } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const userExAccExists: cpz.UserExchangeAccount = await ctx.call(
        `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
        { id: userExAccId, fields: ["id", "status", "exchange", "userId"] }
      );
      if (!userExAccExists)
        throw new Errors.NotFoundError("User Exchange Account not found", {
          userExAccId
        });

      if (userExAccExists.userId !== userId)
        throw new Errors.ForbiddenError("FORBIDDEN", {
          userExAccId: userExAccExists.id
        });
      const robot: {
        id: string;
        exchange: string;
        asset: string;
        currency: string;
        available: number;
      } = await ctx.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id: robotId,
        fields: ["id", "available", "exchange", "asset", "currency"]
      });
      if (!robot)
        throw new Errors.NotFoundError("Robot not found", { robotId });

      if (userExAccExists.exchange !== robot.exchange)
        throw new Error("Wrong exchange");

      const accessValue = getAccessValue(ctx.meta.user);
      if (robot.available < accessValue)
        throw new Errors.ForbiddenError("FORBIDDEN", { robotId: robot.id });

      const [userRobotExists] = await this._find(ctx, {
        query: {
          robotId,
          userExAccId
        }
      });
      if (userRobotExists) throw new Error("User Robot already exists");
      const userRobotId = uuid();

      const [market]: cpz.Market[] = await ctx.call(
        `${cpz.Service.DB_MARKETS}.find`,
        {
          query: {
            exchange: robot.exchange,
            asset: robot.asset,
            currency: robot.currency
          }
        }
      );
      if (settings.volume < market.limits.amount.min)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be more than ${market.limits.amount.min}`
        );

      if (settings.volume > market.limits.amount.max)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be less than ${market.limits.amount.max}`
        );

      await this.adapter.insert({
        id: userRobotId,
        robotId,
        userExAccId,
        userId,
        status: cpz.Status.stopped,
        settings
      });
      return { success: true, result: userRobotId };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async delete(ctx: Context<{ id: string }, { user: cpz.User }>) {
    try {
      const { id } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const userRobotExists: cpz.UserRobotDB = await this._get(ctx, {
        id
      });
      if (!userRobotExists)
        throw new Errors.NotFoundError("User Robot not found", {
          userRobotId: id
        });
      if (userRobotExists.userId !== userId)
        throw new Errors.ForbiddenError("FORBIDDEN", { userRobotId: id });

      if (userRobotExists.status !== cpz.Status.stopped)
        throw new ErrorsBase.ValidationError("User Robot is not stopped");
      const { exchange, asset } = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.get`,
        {
          id: userRobotExists.robotId,
          fields: ["exchange", "asset"]
        }
      );
      await this._remove(ctx, { id });
      await ctx.emit<cpz.StatsCalcUserRobotsEvent>(
        cpz.Event.STATS_CALC_USER_ROBOTS,
        {
          userId,
          exchange,
          asset
        }
      );

      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async edit(
    ctx: Context<
      { id: string; settings: cpz.UserRobotSettings },
      { user: cpz.User }
    >
  ) {
    try {
      const { id, settings } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const userRobotExists: cpz.UserRobotDB = await this._get(ctx, {
        id
      });
      if (!userRobotExists)
        throw new Errors.NotFoundError(
          "User Robot not found",

          { userRobotId: id }
        );
      if (userRobotExists.userId !== userId)
        throw new Errors.ForbiddenError("FORBIDDEN", { userRobotId: id });

      if (userRobotExists.status !== cpz.Status.stopped)
        throw new Error("User Robot is not stopped");

      const robot = await ctx.call<
        {
          id: string;
          exchange: string;
          asset: string;
          currency: string;
        },
        { id: string; fields: string[] }
      >(`${cpz.Service.DB_ROBOTS}.get`, {
        id: userRobotExists.robotId,
        fields: ["id", "exchange", "asset", "currency"]
      });

      if (!robot)
        throw new Errors.NotFoundError(
          "Robot not found",

          { robotId: userRobotExists.robotId }
        );

      const [market]: cpz.Market[] = await ctx.call(
        `${cpz.Service.DB_MARKETS}.find`,
        {
          query: {
            exchange: robot.exchange,
            asset: robot.asset,
            currency: robot.currency
          }
        }
      );

      if (settings.volume < market.limits.amount.min)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be more than ${market.limits.amount.min}`
        );

      if (settings.volume > market.limits.amount.max)
        throw new ErrorsBase.ValidationError(
          `Wrong volume value must be less than ${market.limits.amount.max}`
        );

      await this.adapter.updateById(id, {
        $set: {
          settings
        }
      });
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async getRobots(
    ctx: Context<
      {
        exchange?: string;
        asset?: string;
        currency?: string;
        userId?: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { id: user_id } = ctx.meta.user;
      const available = getAccessValue(ctx.meta.user);
      const { exchange, asset, currency, userId } = ctx.params;
      const params: {
        user_id?: string;
        exchange?: string;
        asset?: string;
        currency?: string;
        available: number;
      } = {
        user_id,
        available
      };
      const query = `
      SELECT t.id, t.name, s.status
      FROM  robots t  
      LEFT JOIN user_robots s 
      ON s.robot_id = t.id AND s.user_id = :user_id
      WHERE t.trading = true
      AND t.available >= :available
      ${exchange ? "AND t.exchange = :exchange" : ""}
      ${asset ? "AND t.asset = :asset" : ""}
      ${currency ? "AND t.currency = :currency" : ""}
      ${userId ? "AND s.user_id = :user_id" : ""}
      `;
      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (currency) params.currency = currency;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getState(ctx: Context<{ id: string }>) {
    try {
      const { id } = ctx.params;
      const query = `SELECT ur.*,
      (SELECT array_to_json(array_agg(rr))
       FROM
         (SELECT r.exchange,
                 r.asset,
                 r.currency,
                 r.timeframe,
                 r.trade_settings
          FROM robots r
          WHERE r.id = ur.robot_id) rr)->0 AS robot,
      (SELECT array_to_json(array_agg(pos))
       FROM
         (SELECT p.*,
            (SELECT array_to_json(array_agg(eo))
             FROM
               (SELECT o.*
                FROM user_orders o
                WHERE o.user_position_id = p.id
                  AND (o.action = 'long'
                       OR o.action = 'short')) eo) AS entry_orders,
            (SELECT array_to_json(array_agg(eo))
             FROM
               (SELECT o.*
                FROM user_orders o
                WHERE o.user_position_id = p.id
                  AND (o.action = 'closeLong'
                       OR o.action = 'closeShort')) eo) AS exit_orders
          FROM user_positions p
          WHERE p.user_robot_id = ur.id
            AND p.status IN ('delayed',
                             'new',
                             'open')) pos) AS positions
    FROM user_robots ur
    WHERE ur.id = :id;`;
      let [rawUserRobotState] = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { id }
      });

      const userRobotState = underscoreToCamelCaseKeys(
        datesToISOString(rawUserRobotState)
      );
      return userRobotState;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserRobot(
    ctx: Context<{ robotId: string }, { user: cpz.User }>
  ): Promise<{
    robotInfo: cpz.RobotInfo;
    userRobotInfo?: cpz.UserRobotInfo;
    market: cpz.Market;
  }> {
    try {
      const { robotId } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const robotInfo: cpz.RobotInfo = await ctx.call(
        `${cpz.Service.DB_ROBOTS}.getRobotBaseInfo`,
        {
          id: robotId
        },
        {
          meta: {
            user: ctx.meta.user
          }
        }
      );
      const accessValue = getAccessValue(ctx.meta.user);
      if (robotInfo.available < accessValue)
        throw new Errors.ForbiddenError("FORBIDDEN", { robotId });
      const [userRobot]: cpz.UserRobotDB[] = await this._find(ctx, {
        query: { robotId, userId }
      });

      let userRobotInfo: cpz.UserRobotInfo;
      if (userRobot) {
        let openPositions: cpz.UserPositionDB[] = [];
        let closedPositions: cpz.UserPositionDB[] = [];
        let userExAccName: string = "";

        ({ name: userExAccName } = await ctx.call(
          `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
          {
            fields: ["name"],
            id: userRobot.userExAccId
          }
        ));

        const positions: cpz.UserPositionDB[] = await ctx.call(
          `${cpz.Service.DB_USER_POSITIONS}.find`,
          {
            limit: 10,
            sort: "-created_at",
            query: {
              userRobotId: userRobot.id,
              $or: [
                {
                  status: cpz.UserPositionStatus.open
                },
                {
                  status: cpz.UserPositionStatus.closed
                },
                {
                  status: cpz.UserPositionStatus.closedAuto
                }
              ]
            }
          }
        );
        if (positions && Array.isArray(positions) && positions.length > 0) {
          openPositions = positions.filter(
            pos => pos.status === cpz.UserPositionStatus.open
          );
          closedPositions = positions.filter(
            pos =>
              pos.status === cpz.UserPositionStatus.closed ||
              pos.status === cpz.UserPositionStatus.closedAuto
          );
        }

        userRobotInfo = {
          ...userRobot,
          userExAccName,
          openPositions,
          closedPositions
        };
      }

      const [market] = await ctx.call(`${cpz.Service.DB_MARKETS}.find`, {
        query: {
          exchange: robotInfo.exchange,
          asset: robotInfo.asset,
          currency: robotInfo.currency
        }
      });

      return {
        robotInfo,
        userRobotInfo,
        market
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserRobotEventInfo(ctx: Context<{ id: string }>) {
    try {
      const query = `SELECT ur.id AS user_robot_id,
     r.id AS robot_id,
     r.name,
     ur.status,
     u.id AS user_id,
     u.telegram_id,
     u.email,
     u.settings
    FROM user_robots ur, robots r, users u
    WHERE ur.robot_id = r.id
    AND ur.user_id = u.id
    AND ur.id = :id`;

      const [rawData] = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { id: ctx.params.id }
      });

      const data = underscoreToCamelCaseKeys(rawData);
      return data;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserRobotsService;
