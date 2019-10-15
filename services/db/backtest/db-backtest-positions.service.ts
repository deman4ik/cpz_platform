import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

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
          timeframe: Sequelize.INTEGER,
          volume: {
            type: Sequelize.NUMBER,
            get: function() {
              const value = this.getDataValue("volume");
              return (value && +value) || value;
            }
          },
          prefix: Sequelize.STRING,
          code: Sequelize.STRING,
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
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryPrice");
              return (value && +value) || value;
            }
          },
          entryDate: {
            type: Sequelize.DATE,
            field: "entry_date",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryDate");
              return (value && value.toISOString()) || value;
            }
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
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryCandleTimestamp");
              return (value && value.toISOString()) || value;
            }
          },
          exitStatus: {
            type: Sequelize.STRING,
            field: "exit_status",
            allowNull: true
          },
          exitPrice: {
            type: Sequelize.NUMBER,
            field: "exit_price",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitPrice");
              return (value && +value) || value;
            }
          },
          exitDate: {
            type: Sequelize.DATE,
            field: "exit_date",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitDate");
              return (value && value.toISOString()) || value;
            }
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
            type: Sequelize.STRING,
            field: "exit_candle_timestamp",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitCandleTimestamp");
              return (value && value.toISOString()) || value;
            }
          },
          alerts: { type: Sequelize.JSONB, allowNull: true },
          profit: {
            type: Sequelize.NUMBER,
            allowNull: true,
            get: function() {
              const value = this.getDataValue("profit");
              return (value && +value) || value;
            }
          },
          barsHeld: {
            type: Sequelize.INTEGER,
            field: "bars_held",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("barsHeld");
              return (value && +value) || value;
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
      actions: {
        upsert: {
          params: {
            entity: {
              type: "object",
              props: {
                id: "string",
                backtestId: { type: "string" },
                timeframe: { type: "number", integer: true },
                volume: "number",
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
                alerts: { type: "object", optional: true },
                profit: { type: "number", optional: true },
                barsHeld: { type: "number", integer: true, optional: true }
              },
              optional: true
            },
            entities: {
              type: "array",
              items: {
                type: "object",
                props: {
                  id: "string",
                  backtestId: { type: "string" },
                  timeframe: { type: "number", integer: true },
                  volume: "number",
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
                  alerts: { type: "object", optional: true },
                  profit: { type: "number", optional: true },
                  barsHeld: { type: "number", integer: true, optional: true }
                }
              },
              optional: true
            }
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context) {
    try {
      if (
        !ctx.params.entity &&
        (!ctx.params.entities ||
          (Array.isArray(ctx.params.entities) &&
            ctx.params.entities.length === 0))
      )
        throw new Errors.ValidationError("Entity or Entities is required!");

      let entitiesRaw: cpz.BacktesterPositionState[] = [];
      if (ctx.params.entity) entitiesRaw = [ctx.params.entity];
      else entitiesRaw = ctx.params.entities;

      const entities = entitiesRaw.map(
        ({
          id,
          backtestId,
          timeframe,
          volume,
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
          profit,
          barsHeld
        }: cpz.BacktesterPositionState) =>
          Object.values({
            id,
            backtestId,
            timeframe,
            volume,
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
            alerts: JSON.stringify(alerts),
            profit,
            barsHeld
          })
      );

      const query = `INSERT INTO backtest_positions
     (  id,
        backtest_id,
        timeframe,
        volume,
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
        profit,
        bars_held
        ) 
        VALUES ${entities
          .map((_: any) => {
            return "(?)";
          })
          .join(",")} 
         ON CONFLICT ON CONSTRAINT backtest_positions_pkey 
         DO UPDATE SET updated_at = now(),
         direction = excluded.direction,
         status = excluded.status,
         entry_status = excluded.entry_status,
         entry_price = excluded.entry_price,
         entry_date = excluded.entry_date,
         entry_order_type = excluded.entry_order_type,
         entry_action = excluded.entry_action,
         entry_candle_timestamp = excluded.entry_candle_timestamp,
         exit_status = excluded.exit_status,
         exit_price = excluded.exit_price,
         exit_date = excluded.exit_date,
         exit_order_type = excluded.exit_order_type,
         exit_action = excluded.exit_action,
         exit_candle_timestamp = excluded.exit_candle_timestamp,
         alerts = excluded.alerts,
         profit = excluded.profit,
         bars_held = excluded.bars_held;`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: entities
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = BacktestPositionsService;
