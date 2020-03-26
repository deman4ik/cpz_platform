import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { v4 as uuid } from "uuid";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class RobotSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_SIGNALS,
      mixins: [DbService],
      adapter:
        process.env.NODE_ENV === "production"
          ? new SqlAdapter(
              process.env.PG_DBNAME,
              process.env.PG_USER,
              process.env.PG_PWD,
              adapterOptions
            )
          : adapter,
      model: {
        name: "robot_signals",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
          action: { type: Sequelize.STRING },
          orderType: { type: Sequelize.STRING, field: "order_type" },
          price: { type: Sequelize.NUMBER },
          type: { type: Sequelize.STRING },
          positionId: { type: Sequelize.STRING, field: "position_id" },
          positionPrefix: { type: Sequelize.STRING, field: "position_prefix" },
          positionCode: { type: Sequelize.STRING, field: "position_code" },
          positionParentId: {
            type: Sequelize.STRING,
            field: "position_parent_id"
          },
          candleTimestamp: {
            type: Sequelize.DATE,
            field: "candle_timestamp",
            get: function() {
              const value = this.getDataValue("candleTimestamp");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          timestamp: {
            type: Sequelize.DATE,
            get: function() {
              const value = this.getDataValue("timestamp");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      events: {
        [cpz.Event.SIGNAL_ALERT]: this.handleSignal,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignal
      }
    });
  }

  async handleSignal(ctx: Context<cpz.SignalEvent>) {
    try {
      await this.adapter.insert({ id: uuid(), ...ctx.params });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = RobotSignalsService;
