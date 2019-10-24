import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

class UserRobotsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ROBOTS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "user_robots",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userExAccId: { type: Sequelize.UUID, field: "user_ex_acc_id" },
          robotId: { type: Sequelize.UUID, field: "robot_id" },
          settings: Sequelize.JSONB,
          internalState: {
            type: Sequelize.JSONB,
            field: "internal_state"
          },
          status: Sequelize.STRING,
          startedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "started_at",
            get: function() {
              const value = this.getDataValue("startedAt");
              return (value && value.toISOString()) || value;
            }
          },
          stoppedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "stopped_at",
            get: function() {
              const value = this.getDataValue("stoppedAt");
              return (value && value.toISOString()) || value;
            }
          },
          statistics: { type: Sequelize.JSONB, allowNull: true },
          equity: { type: Sequelize.JSONB, allowNull: true }
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

export = UserRobotsService;
