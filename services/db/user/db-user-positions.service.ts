import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class UserPositionsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_POSITIONS,
      mixins: [DbService],
      adapter,
      model: {
        name: "user_positions",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          positionId: { type: Sequelize.UUID, field: "position_id" },
          userRobotId: { type: Sequelize.UUID, field: "user_robot_id" },
          userId: { type: Sequelize.UUID, field: "user_id" },
          exchange: { type: Sequelize.STRING },
          asset: { type: Sequelize.STRING },
          currency: { type: Sequelize.STRING },
          prefix: Sequelize.STRING,
          code: Sequelize.STRING,
          positionCode: { type: Sequelize.STRING, field: "position_code" },
          parentId: {
            type: Sequelize.STRING,
            field: "parent_id",
            allowNull: true
          },
          direction: { type: Sequelize.STRING, allowNull: true },
          status: { type: Sequelize.STRING },
          entryStatus: {
            type: Sequelize.STRING,
            field: "entry_status",
            allowNull: true
          },
          entryAction: {
            type: Sequelize.STRING,
            field: "entry_action",
            allowNull: true
          },
          entrySignalPrice: {
            type: Sequelize.NUMBER,
            field: "entry_signal_price",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entrySignalPrice");
              return (value && +value) || value;
            }
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
          entryVolume: {
            type: Sequelize.NUMBER,
            field: "entry_volume",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryVolume");
              return (value && +value) || value;
            }
          },
          entryExecuted: {
            type: Sequelize.NUMBER,
            field: "entry_executed",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryExecuted");
              return (value && +value) || value;
            }
          },
          entryRemaining: {
            type: Sequelize.NUMBER,
            field: "entry_remaining",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("entryRemaining");
              return (value && +value) || value;
            }
          },
          exitStatus: {
            type: Sequelize.STRING,
            field: "exit_status",
            allowNull: true
          },
          exitAction: {
            type: Sequelize.STRING,
            field: "exit_action",
            allowNull: true
          },
          exitSignalPrice: {
            type: Sequelize.NUMBER,
            field: "exit_signal_price",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitSignalPrice");
              return (value && +value) || value;
            }
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
          exitVolume: {
            type: Sequelize.NUMBER,
            field: "exit_volume",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitVolume");
              return (value && +value) || value;
            }
          },
          exitExecuted: {
            type: Sequelize.NUMBER,
            field: "exit_executed",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitExecuted");
              return (value && +value) || value;
            }
          },
          exitRemaining: {
            type: Sequelize.NUMBER,
            field: "exit_remaining",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitRemaining");
              return (value && +value) || value;
            }
          },
          internalState: { type: Sequelize.JSONB, field: "internal_state" },
          reason: { type: Sequelize.STRING, allowNull: true },
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
          },
          nextJobAt: {
            type: Sequelize.DATE,
            field: "next_job_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("nextJobAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          nextJob: {
            type: Sequelize.STRING,
            field: "next_job",
            allowNull: true
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
            entity: { type: "object", optional: true },
            entities: {
              type: "array",
              items: {
                type: "object"
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
      entity?: cpz.UserPositionDB;
      entities?: cpz.UserPositionDB[];
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

      let entitiesRaw: cpz.UserPositionDB[] = [];
      if (ctx.params.entity) entitiesRaw = [ctx.params.entity];
      else entitiesRaw = ctx.params.entities;

      const entities = entitiesRaw.map(
        ({
          id,
          prefix,
          code,
          positionCode,
          positionId,
          userRobotId,
          userId,
          exchange,
          asset,
          currency,
          status,
          parentId,
          direction,
          entryStatus,
          entryAction,
          entrySignalPrice,
          entryPrice,
          entryDate,
          entryCandleTimestamp,
          entryVolume,
          entryExecuted,
          entryRemaining,
          exitStatus,
          exitAction,
          exitSignalPrice,
          exitPrice,
          exitDate,
          exitCandleTimestamp,
          exitVolume,
          exitExecuted,
          exitRemaining,
          internalState,
          reason,
          profit,
          barsHeld,
          nextJobAt,
          nextJob
        }: cpz.UserPositionDB) =>
          Object.values({
            id,
            prefix,
            code,
            positionCode,
            positionId,
            userRobotId,
            userId,
            exchange,
            asset,
            currency,
            status,
            parentId: parentId || null,
            direction: direction || null,
            entryStatus: entryStatus || null,
            entryAction: entryAction || null,
            entrySignalPrice: entrySignalPrice || null,
            entryPrice: entryPrice || null,
            entryDate: entryDate || null,
            entryCandleTimestamp: entryCandleTimestamp || null,
            entryVolume: entryVolume || null,
            entryExecuted: entryExecuted || null,
            entryRemaining: entryRemaining || null,
            exitStatus: exitStatus || null,
            exitAction: exitAction || null,
            exitSignalPrice: exitSignalPrice || null,
            exitPrice: exitPrice || null,
            exitDate: exitDate || null,
            exitCandleTimestamp: exitCandleTimestamp || null,
            exitVolume: exitVolume || null,
            exitExecuted: exitExecuted || null,
            exitRemaining: exitRemaining || null,
            internalState: JSON.stringify(internalState),
            reason: reason || null,
            profit: profit || null,
            barsHeld: barsHeld || null,
            nextJobAt: nextJobAt || null,
            nextJob: nextJob || null
          })
      );

      const query = `INSERT INTO user_positions
      ( id,
        prefix,
        code,
        position_code,
        position_id,
        user_robot_id,
        user_id,
        exchange,
        asset,
        currency,
        status,
        parent_id,
        direction,
        entry_status,
        entry_action,
        entry_signal_price,
        entry_price,
        entry_date,
        entry_candle_timestamp,
        entry_volume,
        entry_executed,
        entry_remaining,
        exit_status,
        exit_action,
        exit_signal_price,
        exit_price,
        exit_date,
        exit_candle_timestamp,
        exit_volume,
        exit_executed,
        exit_remaining,
        internal_state,
        reason,
        profit,
        bars_held,
        next_job_at,
        next_job
         ) 
         VALUES ${entities
           .map((_: any) => {
             return "(?)";
           })
           .join(",")} 
          ON CONFLICT ON CONSTRAINT user_positions_pkey 
          DO UPDATE SET updated_at = now(),
          status = excluded.status,
          entry_status = excluded.entry_status,
          entry_action = excluded.entry_action,
          entry_signal_price = excluded.entry_signal_price,
          entry_price = excluded.entry_price,
          entry_date = excluded.entry_date,
          entry_candle_timestamp = excluded.entry_candle_timestamp,
          entry_volume = excluded.entry_volume,
          entry_executed = excluded.entry_executed,
          entry_remaining = excluded.entry_remaining,
          exit_status = excluded.exit_status,
          exit_action = excluded.exit_action,
          exit_signal_price = excluded.exit_signal_price,
          exit_price = excluded.exit_price,
          exit_date = excluded.exit_date,
          exit_candle_timestamp = excluded.exit_candle_timestamp,
          exit_volume = excluded.exit_volume,
          exit_executed = excluded.exit_executed,
          exit_remaining = excluded.exit_remaining,
          internal_state = excluded.internal_state,
          reason = excluded.reason,
          profit = excluded.profit,
          bars_held = excluded.bars_held,
          next_job_at = excluded.next_job_at,
          next_job = excluded.next_job
          ;`;
      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: entities
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = UserPositionsService;
