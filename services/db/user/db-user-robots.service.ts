import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import { underscoreToCamelCaseKeys } from "../../../utils/helpers";
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
          userId: { type: Sequelize.UUID, filed: "user_id " },
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
              "createUserRobot(userExAccId: String!, robotId: String!, settings: UserRobotSettings!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.create
        },
        getState: {
          params: {
            id: "string"
          },
          handler: this.getState
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
      const { id } = ctx.meta.user;
      const userExAccExists: cpz.UserExchangeAccount = await this.broker.call(
        `${cpz.Service.DB_USER_EXCHANGE_ACCS}.get`,
        { id: userExAccId }
      );
      if (!userExAccExists)
        throw new Errors.MoleculerClientError(
          "User Exchange Account not found",
          404,
          "ERR_NOT_FOUND",
          { userExAccId }
        );

      if (id && userExAccExists.userId !== id)
        throw new Errors.MoleculerClientError("FORBIDDEN");
      const robot = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id: robotId,
        fields: ["id", "available"]
      });
      if (!robot)
        throw new Errors.MoleculerClientError(
          "Robot not found",
          404,
          "ERR_NOT_FOUND",
          { robotId }
        );
      //TODO: check available

      const [userRobotExists] = await this.adapter.find({
        query: {
          robotId,
          userExAccId
        }
      });
      if (userRobotExists)
        throw new Errors.MoleculerClientError("User Robot already exists");
      const userRobotId = uuid();

      //TODO: check volume range
      await this.adapter.insert({
        id: userRobotId,
        robotId,
        userExAccId,
        userId: id,
        status: cpz.Status.stopped,
        settings
      });
      return { success: true, result: userRobotId };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
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
      rawUserRobotState.started_at =
        rawUserRobotState.started_at &&
        rawUserRobotState.started_at.toISOString();
      rawUserRobotState.stopped_at =
        rawUserRobotState.stopped_at &&
        rawUserRobotState.stopped_at.toISOString();
      rawUserRobotState.created_at =
        rawUserRobotState.created_at &&
        rawUserRobotState.created_at.toISOString();
      rawUserRobotState.updated_at =
        rawUserRobotState.updated_at &&
        rawUserRobotState.updated_at.toISOString();
      const userRobotState = underscoreToCamelCaseKeys(rawUserRobotState);
      return userRobotState;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserRobotsService;
