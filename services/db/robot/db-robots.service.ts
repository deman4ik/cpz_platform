import { Service, ServiceBroker, Context } from "moleculer";
import { Errors } from "moleculer-web";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import {
  underscoreToCamelCaseKeys,
  equals,
  createRobotCode,
  createRobotName,
  getAccessValue,
  datesToISOString
} from "../../../utils";
import Auth from "../../../mixins/auth";

class RobotsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOTS,
      settings: {
        graphql: {
          type: `
          input RobotCreateEntity {
            exchange: String!,
            asset: String!, 
            currency: String!, 
            timeframe: Int!, 
            strategy: String!, 
            mod: String, 
            settings: JSON!, 
            tradeSettings: JSON!,
            available: Int,
            signals: Boolean,
            trading: Boolean
          }
          `
        }
      },
      mixins: [Auth, DbService],
      adapter: SqlAdapter,
      model: {
        name: "robots",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          code: Sequelize.STRING,
          name: { type: Sequelize.STRING },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          timeframe: Sequelize.INTEGER,
          strategyName: { type: Sequelize.STRING, field: "strategy" },
          mod: { type: Sequelize.STRING },
          settings: Sequelize.JSONB,
          tradeSettings: { type: Sequelize.JSONB, field: "trade_settings" },
          available: Sequelize.INTEGER,
          signals: Sequelize.BOOLEAN,
          trading: Sequelize.BOOLEAN,
          status: Sequelize.STRING,
          startedAt: {
            type: Sequelize.DATE,
            field: "started_at",
            get: function() {
              const value = this.getDataValue("startedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          stoppedAt: {
            type: Sequelize.DATE,
            field: "stopped_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("stoppedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          indicators: { type: Sequelize.JSONB, allowNull: true },
          state: { type: Sequelize.JSONB, allowNull: true },
          lastCandle: {
            type: Sequelize.JSONB,
            allowNull: true,
            field: "last_candle"
          },
          hasAlerts: { type: Sequelize.BOOLEAN, field: "has_alerts" },
          statistics: { type: Sequelize.JSONB, allowNull: true },
          equity: { type: Sequelize.JSONB, allowNull: true }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        getAvailableExchanges: {
          params: {
            signals: { type: "boolean", optional: true },
            trading: { type: "boolean", optional: true }
          },
          handler: this.getAvailableExchanges
        },
        getAvailableAssets: {
          params: {
            exchange: { type: "string", optional: true },
            signals: { type: "boolean", optional: true },
            trading: { type: "boolean", optional: true }
          },
          handler: this.getAvailableAssets
        },
        getRobotInfo: {
          params: {
            id: "string"
          },
          handler: this.getRobotInfo
        },
        getRobotBaseInfo: {
          params: {
            id: "string"
          },
          handler: this.getRobotBaseInfo
        },
        getTopSignalRobots: {
          params: {
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            limit: { type: "number", integer: true, optional: true }
          },
          handler: this.getTopSignalRobots
        },
        getTopTradingRobots: {
          params: {
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            limit: { type: "number", integer: true, optional: true }
          },
          handler: this.getTopTradingRobots
        },
        create: {
          params: {
            entities: {
              type: "array",
              items: {
                type: "object",
                props: {
                  exchange: "string",
                  asset: "string",
                  currency: "string",
                  timeframe: { type: "number", integer: true },
                  strategy: { type: "string" },
                  mod: { type: "string", optional: true },
                  settings: "object",
                  tradeSettings: "object",
                  available: { type: "number", integer: true, optional: true },
                  signals: { type: "boolean", default: false },
                  trading: { type: "boolean", default: false }
                }
              }
            }
          },
          graphql: {
            mutation: "createRobots(entities: [RobotCreateEntity!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: this.authAction
          },
          handler: this.create
        },
        clear: {
          params: {
            robotId: "string"
          },
          handler: this.clear
        }
      }
    });
  }

  async create(
    ctx: Context<{
      entities: {
        exchange: string;
        asset: string;
        currency: string;
        timeframe: cpz.Timeframe;
        strategy: string;
        mod: string;
        settings: cpz.RobotSettings;
        tradeSettings: cpz.RobotTradeSettings;
        available: number;
        signals: boolean;
        trading: boolean;
      }[];
    }>
  ) {
    try {
      const strategiesList: { id: string; code: string }[] = await ctx.call(
        `${cpz.Service.DB_STRATEGIES}.find`,
        {
          fields: ["id", "code"]
        }
      );
      const strategies: { [key: string]: string } = {};
      strategiesList.forEach(({ id, code }: { id: string; code: string }) => {
        strategies[id] = code;
      });

      let importedCount = 0;
      for (const {
        exchange,
        asset,
        currency,
        timeframe,
        strategy,
        mod,
        settings,
        tradeSettings,
        available,
        signals,
        trading
      } of ctx.params.entities) {
        let mode = mod || 1;
        const [robotExists] = await this.adapter.find({
          fields: ["id", "mod", "settings"],
          sort: "-created_at",
          query: {
            exchange,
            asset,
            currency,
            timeframe,
            strategyName: strategy
          }
        });

        if (robotExists) {
          if (equals(settings, robotExists.settings)) continue;
          const tryNumMod = +robotExists.mod;
          mode = (tryNumMod && tryNumMod + 1) || `${robotExists.mod}-1`;
        }
        const query = `INSERT INTO robots 
        (   code,
            name,
            exchange,
            asset,
            currency,
            timeframe,
            strategy,
            mod,
            settings,
            trade_settings,
            available,
            signals,
          trading
        ) 
         VALUES (?)
         ON CONFLICT ON CONSTRAINT robots_pkey 
         DO UPDATE SET updated_at = now(),
         status = excluded.status,
         settings = excluded.settings,
         trade_settings = excluded.trade_settings,
         indicators = excluded.indicators,
         state = excluded.state,
         last_candle = excluded.last_candle,
         has_alerts = excluded.has_alerts,
         started_at = excluded.started_at,
         stopped_at = excluded.stopped_at,
         statistics = excluded.statistics;`;
        const entity = Object.values({
          code: createRobotCode(
            exchange,
            asset,
            currency,
            timeframe,
            strategies[strategy],
            `${mode}`
          ),
          name: createRobotName(
            exchange,
            asset,
            currency,
            timeframe,
            strategies[strategy],
            `${mode}`
          ),
          exchange,
          asset,
          currency,
          timeframe,
          strategyName: strategy,
          mod: `${mode}`,
          settings: JSON.stringify(settings),
          tradeSettings: JSON.stringify(tradeSettings),
          available,
          signals,
          trading
        });
        await this.adapter.db.query(query, {
          type: Sequelize.QueryTypes.INSERT,
          replacements: [entity]
        });
        importedCount += 1;
      }

      return { success: true, result: `Imported ${importedCount} robots` };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async getAvailableExchanges(
    ctx: Context<
      {
        signals?: boolean;
        trading?: boolean;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { signals, trading } = ctx.params;
      const signalsDefined = signals === true || signals === false;
      const tradingDefined = trading === true || trading === false;
      const available = getAccessValue(ctx.meta.user);
      const params: {
        signals?: boolean;
        trading?: boolean;
        available: number;
      } = {
        available
      };
      const query = `select distinct exchange from robots where available >= :available
        ${signalsDefined ? "AND signals = :signals" : ""}
        ${tradingDefined ? "AND trading = :trading" : ""}
         group by exchange`;
      if (signalsDefined) params.signals = signals;
      if (tradingDefined) params.trading = trading;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getAvailableAssets(
    ctx: Context<
      {
        exchange?: string;
        signals?: boolean;
        trading?: boolean;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { exchange, signals, trading } = ctx.params;
      const signalsDefined = signals === true || signals === false;
      const tradingDefined = trading === true || trading === false;
      const available = getAccessValue(ctx.meta.user);
      const params: {
        exchange?: string;
        signals?: boolean;
        trading?: boolean;
        available: number;
      } = {
        available
      };
      const query = `select distinct asset, currency from robots where available >= :available
        ${exchange ? "AND exchange = :exchange" : ""}
        ${signalsDefined ? "AND signals = :signals" : ""}
        ${tradingDefined ? "AND trading = :trading" : ""}
         group by asset, currency`;
      if (exchange) params.exchange = exchange;
      if (signalsDefined) params.signals = signals;
      if (tradingDefined) params.trading = trading;
      return await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getRobotInfo(
    ctx: Context<{ id: string }, { user: cpz.User }>
  ): Promise<cpz.RobotInfo> {
    try {
      const { id } = ctx.params;
      const query = `select
      t.id,
      t.code,
      t.name,
      t.mod,
      t.exchange,
      t.asset,
      t.currency,
      t.timeframe,
      t.strategy as strategy_name,
	    s.code as strategy_code,
	    s.description,
      t.settings,
      t.available,
      t.signals,
      t.trading,
      t.status,
      t.started_at,
      t.stopped_at,
      t.statistics,
      t.equity,
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
              and cp.status = 'closed' 
            order by cp.entry_date desc
            limit 5 
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
            order by op.entry_date desc
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
      as current_signals 
    from
      robots t 
	  inner join strategies s on t.strategy = s.id  
    where t.id = :id;`;
      const [rawRobotInfo] = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { id }
      });
      const robotInfo: {
        [key: string]: any;
        currentSignals?: { code?: string; alerts?: cpz.AlertInfo[] }[];
      } = underscoreToCamelCaseKeys(datesToISOString(rawRobotInfo));
      const available = getAccessValue(ctx.meta.user);
      if (robotInfo.available < available)
        throw new Errors.ForbiddenError("FORBIDDEN", {
          robotId: robotInfo.id
        });
      let robotSignals: { [key: string]: any }[] = [];
      if (
        robotInfo.currentSignals &&
        Array.isArray(robotInfo.currentSignals) &&
        robotInfo.currentSignals.length > 0
      ) {
        robotInfo.currentSignals.forEach(pos => {
          const currentSignals = Object.values(pos.alerts).map(alert => ({
            code: pos.code,
            ...alert
          }));
          robotSignals = [...robotSignals, ...currentSignals];
        });
      }
      robotInfo.currentSignals = robotSignals;
      return <cpz.RobotInfo>robotInfo;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getRobotBaseInfo(
    ctx: Context<{ id: string }, { user: cpz.User }>
  ): Promise<cpz.RobotBaseInfo> {
    try {
      const { id } = ctx.params;
      const query = `select
      t.id,
      t.code,
      t.name,
      t.mod,
      t.exchange,
      t.asset,
      t.currency,
      t.timeframe,
      t.strategy as strategy_name,
	    s.code as strategy_code,
	    s.description,
      t.settings,
      t.available,
      t.signals,
      t.trading,
      t.status,
      t.started_at,
      t.stopped_at,
      t.statistics,
      t.equity
    from
      robots t, strategies s 
    where t.strategy = s.id 
    and t.id = :id;`;
      const [rawRobotInfo] = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { id }
      });
      const robotInfo = <cpz.RobotInfo>(
        underscoreToCamelCaseKeys(datesToISOString(rawRobotInfo))
      );
      const available = getAccessValue(ctx.meta.user);
      if (robotInfo.available < available)
        throw new Errors.ForbiddenError("FORBIDDEN", {
          robotId: robotInfo.id
        });

      return robotInfo;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getTopSignalRobots(
    ctx: Context<
      {
        exchange?: string;
        asset?: string;
        limit?: number;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { id: user_id } = ctx.meta.user;
      const available = getAccessValue(ctx.meta.user);
      const { exchange, asset, limit } = ctx.params;
      const params: {
        user_id: string;
        exchange?: string;
        asset?: string;
        limit?: number;
        available: number;
      } = {
        user_id,
        available
      };
      const query = `SELECT t.id,
t.name,
((t.statistics -> 'netProfit'::text) ->> 'all'::text)::numeric AS profit,
CASE
    WHEN s.user_id IS NOT NULL THEN TRUE
    ELSE FALSE
END AS susbcribed
FROM robots t
LEFT JOIN user_signals s ON s.robot_id = t.id
AND s.user_id = :user_id
WHERE t.statistics <> '{}'::JSONB
AND t.signals = TRUE
AND t.available >= :available
${exchange ? "AND t.exchange = :exchange" : ""}
${asset ? "AND t.asset = :asset" : ""}
ORDER BY (((t.statistics -> 'recoveryFactor'::text) ->> 'all'::text)::numeric) DESC
${limit ? "LIMIT :limit" : ""};`;

      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (limit) params.limit = limit;

      return this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getTopTradingRobots(
    ctx: Context<
      {
        exchange?: string;
        asset?: string;
        limit?: number;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const { id: user_id } = ctx.meta.user;
      const available = getAccessValue(ctx.meta.user);
      const { exchange, asset, limit } = ctx.params;
      const params: {
        user_id: string;
        exchange?: string;
        asset?: string;
        limit?: number;
        available: number;
      } = {
        user_id,
        available
      };
      const query = `SELECT t.id,
t.name,
((t.statistics -> 'netProfit'::text) ->> 'all'::text)::numeric AS profit,
CASE
    WHEN s.user_id IS NOT NULL THEN TRUE
    ELSE FALSE
END AS susbcribed
FROM robots t
LEFT JOIN user_robots s 
ON s.robot_id = t.id AND s.user_id = :user_id
WHERE t.statistics <> '{}'::JSONB
AND t.trading = TRUE
AND t.available >= :available
${exchange ? "AND t.exchange = :exchange" : ""}
${asset ? "AND t.asset = :asset" : ""}
ORDER BY (((t.statistics -> 'recoveryFactor'::text) ->> 'all'::text)::numeric) DESC
${limit ? "LIMIT :limit" : ""};`;

      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (limit) params.limit = limit;

      return this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async clear(ctx: Context<{ robotId: string }>) {
    try {
      const query = `delete from robot_positions 
     where robot_id=:id`;
      const query2 = `delete from robot_signals 
     where robot_id=:id`;
      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.DELETE,
        replacements: { id: ctx.params.robotId }
      });
      await this.adapter.db.query(query2, {
        type: Sequelize.QueryTypes.DELETE,
        replacements: { id: ctx.params.robotId }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = RobotsService;
