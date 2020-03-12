import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import adapterOptions from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class BacktestsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_BACKTESTS,
      mixins: [DbService],
      adapter: new SqlAdapter(
        process.env.PG_DBNAME,
        process.env.PG_USER,
        process.env.PG_PWD,
        adapterOptions
      ),
      model: {
        name: "backtests",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          timeframe: Sequelize.INTEGER,
          strategyName: { type: Sequelize.STRING, field: "strategy_name" },
          dateFrom: {
            type: Sequelize.STRING,
            field: "date_from",
            get: function() {
              const value = this.getDataValue("dateFrom");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          dateTo: {
            type: Sequelize.STRING,
            field: "date_to",
            get: function() {
              const value = this.getDataValue("dateTo");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          settings: Sequelize.JSONB,
          robotSettings: { type: Sequelize.JSONB, field: "robot_settings" },
          robotState: {
            type: Sequelize.JSONB,
            allowNull: true,
            field: "robot_state"
          },
          robotIndicators: {
            type: Sequelize.JSONB,
            allowNull: true,
            field: "robot_indicators"
          },
          statistics: { type: Sequelize.JSON, allowNull: true },
          equity: { type: Sequelize.JSON, allowNull: true },
          totalBars: {
            type: Sequelize.INTEGER,
            field: "total_bars",
            allowNull: true
          },
          processedBars: {
            type: Sequelize.INTEGER,
            field: "processed_bars",
            allowNull: true
          },
          leftBars: {
            type: Sequelize.INTEGER,
            field: "left_bars",
            allowNull: true
          },
          completedPercent: {
            type: Sequelize.INTEGER,
            field: "completed_percent",
            allowNull: true
          },
          status: Sequelize.STRING,
          startedAt: {
            type: Sequelize.STRING,
            field: "started_at",
            get: function() {
              const value = this.getDataValue("startedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          finishedAt: {
            type: Sequelize.STRING,
            field: "finished_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("finishedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          error: { type: Sequelize.JSONB, allowNull: true }
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
                robotId: { type: "string", optional: true },
                exchange: "string",
                asset: "string",
                currency: "string",
                timeframe: { type: "number" },
                strategyName: { type: "string" },
                dateFrom: "string",
                dateTo: "string",
                settings: "object",
                robotSettings: "object",
                robotState: { type: "object", optional: true },
                robotIndicators: { type: "object", optional: true },
                statistics: { type: "object", optional: true },
                equity: { type: "object", optional: true },
                totalBars: { type: "number", optional: true },
                processedBars: { type: "number", optional: true },
                leftBars: { type: "number", optional: true },
                completedPercent: { type: "number", optional: true },
                status: "string",
                startedAt: { type: "string", optional: true },
                finishedAt: { type: "string", optional: true },
                error: {
                  type: "string",
                  optional: true
                }
              }
            }
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context<{ entity: cpz.BacktesterState }>) {
    try {
      const {
        id,
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        dateFrom,
        dateTo,
        settings,
        robotSettings,
        robotState,
        robotIndicators,
        statistics,
        equity,
        totalBars,
        processedBars,
        leftBars,
        completedPercent,
        status,
        startedAt,
        finishedAt,
        error
      }: cpz.BacktesterState = ctx.params.entity;
      const value = Object.values({
        id,
        robotId,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        dateFrom,
        dateTo,
        settings: JSON.stringify(settings),
        robotSettings: JSON.stringify(robotSettings),
        robotState: JSON.stringify(robotState),
        robotIndicators: JSON.stringify(robotIndicators),
        statistics: JSON.stringify(statistics),
        equity: JSON.stringify(equity),
        totalBars,
        processedBars,
        leftBars,
        completedPercent,
        status,
        startedAt,
        finishedAt,
        error: JSON.stringify(error)
      });
      const query = `INSERT INTO backtests 
        ( id, 
          robot_id,
          exchange,
          asset,
          currency,
          timeframe,
          strategy_name,
          date_from,
          date_to,
          settings,
          robot_settings,
          robot_state,
          robot_indicators,
          statistics,
          equity,
          total_bars,
          processed_bars,
          left_bars,
          completed_percent,
          status,
          started_at,
          finished_at, 
          error
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT backtests_pkey 
         DO UPDATE SET updated_at = now(),
         status = excluded.status,
         robot_id = excluded.robot_id,
         exchange = excluded.exchange,
         asset = excluded.asset,
         currency = excluded.currency,
         timeframe = excluded.timeframe,
         strategy_name = excluded.strategy_name,
         date_from = excluded.date_from,
         date_to = excluded.date_to,
         settings = excluded.settings,
         robot_settings = excluded.robot_settings,
         robot_state = excluded.robot_state,
         robot_indicators = excluded.robot_indicators,
         statistics = excluded.statistics,
         equity = excluded.equity,
         total_bars = excluded.total_bars,
         processed_bars = excluded.processed_bars,
         left_bars = excluded.left_bars,
         completed_percent = excluded.completed_percent,
         started_at = excluded.started_at,
         finished_at = excluded.finished_at,
         error = excluded.error;`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: [value]
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = BacktestsService;
