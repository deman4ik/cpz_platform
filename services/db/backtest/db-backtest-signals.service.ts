import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class BacktestSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_BACKTEST_SIGNALS,
      mixins: [DbService],
      adapter,
      model: {
        name: "backtest_signals",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          backtestId: { type: Sequelize.STRING, field: "backtest_id" },
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
      }
    });
  }
}

export = BacktestSignalsService;
