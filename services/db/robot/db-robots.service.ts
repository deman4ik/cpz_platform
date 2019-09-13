import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";
import { Op } from "sequelize";
import { underscoreToCamelCaseKeys } from "../../../utils/helpers";
class RobotsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOTS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "robots",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          code: Sequelize.STRING,
          name: { type: Sequelize.STRING, allowNull: true },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          timeframe: Sequelize.INTEGER,
          strategyName: { type: Sequelize.STRING, field: "strategy" },
          description: { type: Sequelize.TEXT, allowNull: true },
          settings: Sequelize.JSONB,
          available: Sequelize.INTEGER,
          status: Sequelize.STRING,
          startedAt: { type: Sequelize.STRING, field: "started_at" },
          stoppedAt: {
            type: Sequelize.STRING,
            field: "stopped_at",
            allowNull: true
          },
          indicators: { type: Sequelize.JSONB, allowNull: true },
          state: { type: Sequelize.JSONB, allowNull: true },
          lastCandle: {
            type: Sequelize.JSONB,
            allowNull: true,
            field: "last_candle"
          },
          hasAlerts: { type: Sequelize.BOOLEAN, field: "has_alerts" },
          statistics: { type: Sequelize.JSONB, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        findActive: {
          params: {
            exchange: "string",
            asset: "string",
            currency: "string",
            timeframe: { type: "number", optional: true }
          },
          handler: this.findActive
        },
        getAvailableSignalAssets: {
          handler: this.getAvailableSignalAssets
        },
        getRobotInfo: {
          params: {
            id: "string"
          },
          handler: this.getRobotInfo
        },
        upsert: {
          params: {
            entity: {
              type: "object",
              props: {
                id: "string",
                code: "string",
                name: { type: "string", optional: true },
                exchange: "string",
                asset: "string",
                currency: "string",
                timeframe: { type: "number", integer: true },
                strategyName: { type: "string" },
                description: { type: "string", optional: true },
                settings: "object",
                available: { type: "number", integer: true },
                status: "string",
                startedAt: { type: "string", optional: true },
                stoppedAt: { type: "string", optional: true },
                indicators: { type: "object", optional: true },
                state: { type: "object", optional: true },
                lastCandle: { type: "object", optional: true },
                hasAlerts: "boolean",
                statistics: { type: "object", optional: true }
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
        code,
        name,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        description,
        settings,
        available,
        status,
        startedAt,
        stoppedAt,
        indicators,
        state,
        lastCandle,
        hasAlerts,
        statistics
      }: cpz.RobotState = ctx.params.entity;
      const value = Object.values({
        id,
        code,
        name,
        exchange,
        asset,
        currency,
        timeframe,
        strategyName,
        description,
        settings: JSON.stringify(settings),
        available,
        status,
        startedAt,
        stoppedAt,
        indicators: JSON.stringify(indicators),
        state: JSON.stringify(state),
        lastCandle: JSON.stringify(lastCandle),
        hasAlerts,
        statistics: JSON.stringify(statistics)
      });
      const query = `INSERT INTO robots 
        (   id,
            code,
            name,
            exchange,
            asset,
            currency,
            timeframe,
            strategy,
            description,
            settings,
            available,
            status,
            started_at,
            stopped_at,
            indicators,
            state,
            last_candle,
            has_alerts,
            statistics
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT robots_pkey 
         DO UPDATE SET updated_at = now(),
         status = excluded.status,
         settings = excluded.settings,
         indicators = excluded.indicators,
         state = excluded.state,
         last_candle = excluded.last_candle,
         has_alerts = excluded.has_alerts,
         started_at = excluded.started_at,
         stopped_at = excluded.stopped_at,
         statistics = excluded.statistics;`;

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

  async findActive(ctx: Context) {
    return await this.adapter.find({
      query: {
        ...ctx.params,
        [Op.or]: [
          {
            status: cpz.Status.started
          },
          {
            status: cpz.Status.paused
          }
        ]
      }
    });
  }

  async getAvailableSignalAssets() {
    try {
      const query =
        "select distinct asset, currency from robots where available >= 20 group by asset, currency";
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT
      });
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }

  async getRobotInfo(ctx: Context) {
    try {
      const { id } = ctx.params;
      const query = `select
      t.id,
      t.code,
      t.name,
      t.description,
      t.exchange,
      t.asset,
      t.currency,
      t.timeframe,
      t.strategy,
      t.settings,
      t.available,
      t.status,
      t.started_at,
      t.stopped_at,
      t.statistics,
      (
        select
          array_to_json(array_agg(pos)) 
        from
          (
            select
              cp.* 
            from
              robot_positions cp 
            where
              cp.robot_id = t.id 
              and cp.status = 'closed' limit 5 
          )
          pos 
      )
      as closed_positions,
      (
        select
          array_to_json(array_agg(pos)) 
        from
          (
            select
              op.* 
            from
              robot_positions op 
            where
              op.robot_id = t.id 
              and 
              op.status = 'open'
          )
          pos 
      )
      as open_positions,
      (
        select
          array_to_json(array_agg(pos)) 
        from
          (
            select
              sp.code,
              sp.alerts 
            from
              robot_positions sp 
            where
              sp.robot_id = t.id 
              and 
              (
                sp.status = 'new' 
                or sp.status = 'open' 
              )
              and 
              (
                sp.alerts != '{}' 
                and sp.alerts is not null 
              )
          )
          pos 
      )
      as signals 
    from
      robots t
    where t.id = :id;`;
      const [rawRobotInfo] = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { id }
      });
      const robotInfo = underscoreToCamelCaseKeys(rawRobotInfo);

      let robotSignals: { [key: string]: any }[] = [];
      if (
        robotInfo.signals &&
        Array.isArray(robotInfo.signals) &&
        robotInfo.signals.length > 0
      ) {
        robotInfo.signals.forEach(pos => {
          const signals = Object.values(pos.alerts).map(alert => ({
            code: pos.code,
            ...alert
          }));
          robotSignals = [...robotSignals, ...signals];
        });
      }
      robotInfo.signals = robotSignals;
      return robotInfo;
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = RobotsService;
