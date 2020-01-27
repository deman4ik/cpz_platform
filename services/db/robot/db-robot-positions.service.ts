import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import { underscoreToCamelCaseKeys, datesToISOString } from "../../../utils";

class RobotPositionsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_POSITIONS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "robot_positions",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
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
            type: Sequelize.NUMBER,
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
            type: Sequelize.DATE,
            field: "exit_candle_timestamp",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitCandleTimestamp");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
        getUserSignalPositions: {
          params: {
            userId: { type: "string", optional: true },
            robotId: { type: "string", optional: true },
            exchange: { type: "string", optional: true },
            asset: { type: "string", optional: true },
            currency: { type: "string", optional: true }
          },
          handler: this.getUserSignalPositions
        },
        upsert: {
          params: {
            entity: {
              type: "object",
              props: {
                id: "string",
                robotId: { type: "string" },
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
                  robotId: { type: "string" },
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

  async upsert(
    ctx: Context<{
      entity?: cpz.RobotPositionState;
      entities?: cpz.RobotPositionState[];
    }>
  ) {
    try {
      if (
        !ctx.params.entity &&
        (!ctx.params.entities ||
          (Array.isArray(ctx.params.entities) &&
            ctx.params.entities.length === 0))
      )
        throw new Errors.ValidationError("Entity or Entities is required!");

      let entitiesRaw: cpz.RobotPositionState[] = [];
      if (ctx.params.entity) entitiesRaw = [ctx.params.entity];
      else entitiesRaw = ctx.params.entities;

      const entities = entitiesRaw.map(
        ({
          id,
          robotId,
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
        }: cpz.RobotPositionState) =>
          Object.values({
            id,
            robotId,
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
      const query = `INSERT INTO robot_positions
     (  id,
        robot_id,
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
         ON CONFLICT ON CONSTRAINT robot_positions_pkey 
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
      throw e;
    }
  }

  async getUserSignalPositions(
    ctx: Context<{
      userId?: string;
      robotId?: string;
      exchange?: string;
      asset?: string;
      currency?: string;
    }>
  ) {
    try {
      const { userId, robotId, exchange, asset, currency } = ctx.params;
      const params: {
        user_id?: string;
        robot_id?: string;
        exchange?: string;
        asset?: string;
        currency?: string;
      } = {};
      const query = `
      SELECT p.*,
       r.exchange,
       r.asset,
       r.currency,
       us.user_id,
       us.volume AS user_signal_volume
FROM robot_positions p,
     robots r,
     user_signals us
WHERE p.robot_id = r.id
  AND us.robot_id = r.id
  AND p.status = 'closed'
  AND p.entry_date >= us.subscribed_at
  ${userId ? "AND us.user_id = :user_id" : ""}
  ${robotId ? "AND r.id = :robot_id" : ""}
  ${exchange ? "AND r.exchange = :exchange" : ""}
  ${asset ? "AND r.asset = :asset" : ""}
  ${currency ? "AND r.currency = :currency" : ""}
  ;`;

      if (userId) params.user_id = userId;
      if (robotId) params.robot_id = robotId;
      if (exchange) params.exchange = exchange;
      if (asset) params.asset = asset;
      if (currency) params.currency = currency;

      const rawSignalPositions = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: params
      });
      if (
        !rawSignalPositions ||
        !Array.isArray(rawSignalPositions) ||
        rawSignalPositions.length === 0
      )
        return [];
      const signalPositions = underscoreToCamelCaseKeys(
        datesToISOString(rawSignalPositions)
      );
      return signalPositions;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = RobotPositionsService;
