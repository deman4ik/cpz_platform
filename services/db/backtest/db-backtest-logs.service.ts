import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class BacktestSignalsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_BACKTEST_LOGS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "backtest_logs",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          backtestId: { type: Sequelize.STRING, field: "backtest_id" },
          data: { type: Sequelize.JSONB }
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
