import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";

class RobotJobsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_ROBOT_JOBS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "robot_jobs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          robotId: { type: Sequelize.STRING, field: "robot_id" },
          type: Sequelize.STRING,
          data: { type: Sequelize.JSONB, allowNull: true }
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
                robotId: "string",
                type: "string",
                data: { type: "object", optional: true }
              }
            }
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context<{ entity: cpz.RobotJob }>) {
    try {
      const { robotId, type, data }: cpz.RobotJob = ctx.params.entity;
      const value = Object.values({
        robotId,
        type,
        data: JSON.stringify(data)
      });
      const query = `INSERT INTO robot_jobs
     (  
        robot_id,
        type,
        data
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT robot_jobs_robot_id_type_key 
         DO UPDATE SET updated_at = now(),
         type = excluded.type,
         data = excluded.data`;

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

export = RobotJobsService;
