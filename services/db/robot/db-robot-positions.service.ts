import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

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
          profit: { type: Sequelize.NUMBER, allowNull: true },
          barsHeld: {
            type: Sequelize.INTEGER,
            field: "bars_held",
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
            entity: {
              type: "object",
              props: {
                id: "string",
                robotId: { type: "string" },
                timeframe: { type: "number", integer: true },
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
                profit: { type: "number", optional: true },
                barsHeld: { type: "number", integer: true, optional: true }
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
        timeframe,
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
      }: cpz.RobotPositionState = ctx.params.entity;
      const value = Object.values({
        id,
        robotId,
        timeframe,
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
      });
      const query = `INSERT INTO robot_positions
     (  id,
        robot_id,
        timeframe,
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
        VALUES (?)
         ON CONFLICT ON CONSTRAINT robot_positions_pkey 
         DO UPDATE SET updated_at = now(),
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
        replacements: [value]
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerRetryableError(e.message, 500, this.name, e);
    }
  }
}

export = RobotPositionsService;
