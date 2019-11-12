import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

class UserOrdersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ORDERS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_orders",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userExAccId: { type: Sequelize.UUID, field: "user_ex_acc_id" },
          userRobotId: { type: Sequelize.UUID, field: "user_robot_id" },
          positionId: { type: Sequelize.UUID, field: "position_id" },
          userPositionId: { type: Sequelize.UUID, field: "user_position_id" },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          action: Sequelize.STRING,
          direction: Sequelize.STRING,
          type: Sequelize.STRING,
          signalPrice: {
            type: Sequelize.NUMBER,
            field: "signal_price",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("signalPrice");
              return (value && +value) || value;
            }
          },
          price: {
            type: Sequelize.NUMBER,
            field: "price",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("price");
              return (value && +value) || value;
            }
          },
          volume: {
            type: Sequelize.NUMBER,
            get: function() {
              const value = this.getDataValue("volume");
              return (value && +value) || value;
            }
          },
          status: Sequelize.STRING,
          exId: { type: Sequelize.STRING, allowNull: true, field: "ex_id" },
          exTimestamp: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "ex_timestamp",
            get: function() {
              const value = this.getDataValue("exTimestamp");
              return (value && value.toISOString()) || value;
            }
          },
          exLastTradeAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "ex_last_trade_at",
            get: function() {
              const value = this.getDataValue("exLastTradeAt");
              return (value && value.toISOString()) || value;
            }
          },
          remaining: {
            type: Sequelize.NUMBER,
            field: "remaining",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("remaining");
              return (value && +value) || value;
            }
          },
          executed: {
            type: Sequelize.NUMBER,
            field: "executed",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("executed");
              return (value && +value) || value;
            }
          },
          lastCheckedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "last_checked_at",
            get: function() {
              const value = this.getDataValue("lastCheckedAt");
              return (value && value.toISOString()) || value;
            }
          },
          params: {
            type: Sequelize.JSONB,
            allowNull: true
          },
          error: {
            type: Sequelize.JSONB,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "created_at",
            get: function() {
              const value = this.getDataValue("createdAt");
              return (value && value.toISOString()) || value;
            }
          },
          nextJobAt: {
            type: Sequelize.DATE,
            field: "next_job_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("nextJobAt");
              return (value && value.toISOString()) || value;
            }
          },
          nextJob: {
            type: Sequelize.JSONB,
            field: "next_job",
            allowNull: true
          }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        getUserExAccsWithJobs: {
          handler: this.getUserExAccsWithJobs
        }
      }
    });
  }

  async getUserExAccsWithJobs(ctx: Context) {
    try {
      const query = `select user_ex_acc_id from user_orders where next_job_at is not null and next_job_at <= now() group by user_ex_acc_id;`;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserOrdersService;