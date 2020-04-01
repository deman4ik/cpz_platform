import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class UserOrdersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ORDERS,
      mixins: [DbService],
      adapter,
      model: {
        name: "user_orders",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          exLastTradeAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "ex_last_trade_at",
            get: function() {
              const value = this.getDataValue("exLastTradeAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
        update: {
          handler: this.update
        }
      }
    });
  }

  async update(ctx: Context<cpz.Order>) {
    const data: { [key: string]: any } = ctx.params;
    let id;
    let set: { [key: string]: any } = {};
    Object.keys(data).forEach(key => {
      if (key === "id") id = data[key];
      else set[key] = data[key];
    });
    await this.adapter.updateById(id, { $set: set });
  }
}

export = UserOrdersService;
