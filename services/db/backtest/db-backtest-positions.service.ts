import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class BacktestPositionsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_BACKTEST_POSITIONS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "backtest_positions",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          backtestId: { type: Sequelize.STRING, field: "backtest_id" },
          prefix: "string",
          code: "string",
          parentId: {
            type: Sequelize.STRING,
            field: "parent_id",
            allowNull: true
          },
          direction: { type: Sequelize.STRING, allowNull: true },
          status: { type: Sequelize.STRING, allowNull: true },
          entryStatus: {
            type: Sequelize.STRING,
            field: "entry_status",
            allowNull: true
          },
          entryPrice: {
            type: Sequelize.STRING,
            field: "entry_price",
            allowNull: true
          },
          entryDate: {
            type: Sequelize.DATE,
            field: "entry_date",
            allowNull: true
          },
          entryOrderType: {
            type: Sequelize.STRING,
            field: "entry_order_type",
            allowNull: true
          },
          entryAction: {
            type: Sequelize.STRING,
            field: "entry_action",
            allowNull: true
          },
          entryCandleTimestamp: {
            type: Sequelize.DATE,
            field: "entry_candle_timestamp",
            allowNull: true
          },
          exitStatus: {
            type: Sequelize.STRING,
            field: "exit_status",
            allowNull: true
          },
          exitPrice: {
            type: Sequelize.NUMBER,
            field: "exit_price",
            allowNull: true
          },
          exitDate: {
            type: Sequelize.DATE,
            field: "exit_date",
            allowNull: true
          },
          exitOrderType: {
            type: Sequelize.STRING,
            field: "exit_order_type",
            allowNull: true
          },
          exitAction: {
            type: Sequelize.STRING,
            field: "exit_action",
            allowNull: true
          },
          exitCandleTimestamp: {
            type: Sequelize.DATE,
            field: "exit_candle_timestamp",
            allowNull: true
          },
          alerts: { type: Sequelize.JSONB, allowNull: true },
          profit: { type: Sequelize.NUMBER, allowNull: true }
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
            entity: {
              type: "object",
              props: {
                id: "string",
                backtestId: { type: "string" },
                dateTo: "string",
                prefix: "string",
                code: "string",
                parentId: { type: "string", optional: true },
                direction: { type: "string", optional: true },
                status: { type: "string", optional: true },
                entryStatus: { type: "string", optional: true },
                entryPrice: { type: "number", optional: true },
                entryDate: { type: "string", optional: true },
                entryOrderType: { type: "string", optional: true },
                entryAction: { type: "string", optional: true },
                entryCandleTimestamp: { type: "string", optional: true },
                exitStatus: { type: "string", optional: true },
                exitPrice: { type: "number", optional: true },
                exitDate: { type: "string", optional: true },
                exitOrderType: { type: "string", optional: true },
                exitAction: { type: "string", optional: true },
                exitCandleTimestamp: { type: "string", optional: true },
                alerts: { type: "string", optional: true },
                profit: { type: "number", optional: true }
              }
            }
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context) {
    try {
      const {
        id,
        backtestId,
        prefix,
        code,
        parentId,
        direction,
        status,
        entryStatus,
        entryPrice,
        entryDate,
        entryOrderType,
        entryAction,
        entryCandleTimestamp,
        exitStatus,
        exitPrice,
        exitDate,
        exitOrderType,
        exitAction,
        exitCandleTimestamp,
        alerts,
        profit
      }: cpz.BacktesterPositionState = ctx.params.entity;
      const value = Object.values({
        id,
        backtestId,
        prefix,
        code,
        parentId,
        direction,
        status,
        entryStatus,
        entryPrice,
        entryDate,
        entryOrderType,
        entryAction,
        entryCandleTimestamp,
        exitStatus,
        exitPrice,
        exitDate,
        exitOrderType,
        exitAction,
        exitCandleTimestamp,
        alerts,
        profit
      });
      const query = `INSERT INTO backtest_positions
     (  id,
        backtest_id,
        prefix,
        code,
        parent_id,
        direction,
        status,
        entry_status,
        entry_price,
        entry_date,
        entry_order_type,
        entry_action,
        entry_candle_timestamp,
        exit_status,
        exit_price,
        exit_date,
        exit_order_type,
        exit_action,
        exit_candle_timestamp,
        alerts,
        profit
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT backtest_positions_pkey 
         DO UPDATE SET updated_at = now(),
         exit_status = excluded.exit_status,
         exit_price = excluded.exit_price,
         exit_date = excluded.exit_date,
         exit_order_type = excluded.exit_order_type,
         exit_action = excluded.exit_action,
         exit_candle_timestamp = excluded.exit_candle_timestamp,
         alerts = excluded.alerts,
         profit = excluded.profit;`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: [value]
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = BacktestPositionsService;