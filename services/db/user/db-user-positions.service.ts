import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

class UserPositionsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_POSITIONS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_positions",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          positionId: { type: Sequelize.UUID, field: "position_id" },
          userRobotId: { type: Sequelize.UUID, field: "user_robot_id" },
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
              return (value && value.toISOString()) || value;
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
          entrySlippageCount: {
            type: Sequelize.INTEGER,
            field: "entry_slippage_count",
            get: function() {
              const value = this.getDataValue("entrySlippageCount");
              return (value && +value) || value;
            }
          },
          entryOrderIds: {
            type: Sequelize.JSONB,
            field: "entry_order_ids",
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
          exitVolume: {
            type: Sequelize.NUMBER,
            field: "exit_volume",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("exitVolume");
              return (value && +value) || value;
            }
          },
          exitSlippageCount: {
            type: Sequelize.INTEGER,
            field: "exit_slippage_count",
            get: function() {
              const value = this.getDataValue("exitSlippageCount");
              return (value && +value) || value;
            }
          },
          exitOrderIds: {
            type: Sequelize.JSONB,
            field: "exit_order_ids",
            allowNull: true
          },
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
          }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      }
    });
  }
}

export = UserPositionsService;
