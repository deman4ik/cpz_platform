import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { underscoreToCamelCaseKeys, equals } from "../../../utils/helpers";
import { createRobotCode, createRobotName } from "../../../utils/naming";
import Auth from "../../../mixins/auth";

class RobotsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOTS,
      dependencies: [
        cpz.Service.DB_ROBOT_POSITIONS,
        cpz.Service.DB_ROBOT_SIGNALS
      ],
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
            available: Int
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
          status: Sequelize.STRING,
          startedAt: {
            type: Sequelize.DATE,
            field: "started_at",
            get: function() {
              const value = this.getDataValue("startedAt");
              return (value && value.toISOString()) || value;
            }
          },
          stoppedAt: {
            type: Sequelize.DATE,
            field: "stopped_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("stoppedAt");
              return (value && value.toISOString()) || value;
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
                  available: { type: "number", integer: true, optional: true }
                }
              }
            }
          },
          graphql: {
            mutation: "createRobots(entities: [RobotCreateEntity!]!): Response!"
          },
          roles: [cpz.UserRoles.admin],
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
      }[];
    }>
  ) {
    try {
      const strategiesList = await this.broker.call(
        `${cpz.Service.DB_STRATEGIES}.find`,
        {
          fields: ["id", "code"]
        }
      );
      const strategies: { [key: string]: string } = {};
      strategiesList.forEach(({ id, code }: { id: string; code: string }) => {
        strategies[id] = code;
      });
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
            available
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
        available
      } of ctx.params.entities) {
        let mode = mod || 1;
        const [robotEntity] = await this.adapter.find({
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

        const robotExists =
          robotEntity && this.adapter.entityToObject(robotEntity);

        if (robotExists) {
          if (equals(settings, robotExists.settings)) continue;
          const tryNumMod = +robotExists.mod;
          mode = (tryNumMod && tryNumMod + 1) || `${robotExists.mod}-1`;
        }

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
          available
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
      return { success: false, error: e };
    }
  }

  async findActive(ctx: Context) {
    try {
      return await this.adapter.find({
        query: {
          ...ctx.params,
          $or: [
            {
              status: cpz.Status.started
            },
            {
              status: cpz.Status.starting
            },
            {
              status: cpz.Status.paused
            }
          ]
        }
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
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
      throw e;
    }
  }

  async getRobotInfo(ctx: Context<{ id: string }>) {
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
      t.strategy,
	    s.code as strategy_code,
	    s.name as strategy_name,
	    s.description,
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
      as signals 
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
        signals?: { code?: string; alerts?: { [key: string]: any }[] }[];
      } = underscoreToCamelCaseKeys(rawRobotInfo);
      //TODO: TYPINGS!
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
