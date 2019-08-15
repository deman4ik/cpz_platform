import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class BacktestsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_BACKTESTS,
      mixins: [DbService],
      adapter: SqlAdapter,
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
          dateFrom: { type: Sequelize.DATE, field: "date_from" },
          dateTo: { type: Sequelize.DATE, field: "date_to" },
          settings: Sequelize.JSONB,
          robotSettings: { type: Sequelize.JSONB, field: "robot_settings" },
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
          startedAt: { type: Sequelize.DATE, field: "started_at" },
          finishedAt: {
            type: Sequelize.DATE,
            field: "finished_at",
            allowNull: true
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
                totalBars: { type: "number", optional: true },
                processedBars: { type: "number", optional: true },
                leftBars: { type: "number", optional: true },
                completedPercent: { type: "number", optional: true },
                status: "string",
                startedAt: { type: "string", optional: true },
                finishedAt: { type: "string", optional: true },
                error: {
                  type: "object",
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

  async upsert(ctx: Context) {
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
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = BacktestsService;
