import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import adapterOptions from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import {
  underscoreToCamelCaseKeys,
  datesToISOString
} from "../../../utils/helpers";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class UserRobotJobsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USER_ROBOT_JOBS,
      mixins: [DbService],
      adapter: new SqlAdapter(
        process.env.PG_DBNAME,
        process.env.PG_USER,
        process.env.PG_PWD,
        adapterOptions
      ),
      model: {
        name: "user_robot_jobs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userRobotId: { type: Sequelize.STRING, field: "user_robot_id" },
          type: Sequelize.STRING,
          data: { type: Sequelize.JSONB, allowNull: true },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "created_at",
            get: function() {
              const value = this.getDataValue("createdAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
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
        getIdled: {
          params: {
            date: "string"
          },
          handler: this.getIdled
        },
        upsert: {
          params: {
            entity: {
              type: "object",
              props: {
                id: "string",
                userRobotId: "string",
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

  async getIdled(
    ctx: Context<{
      date: string;
    }>
  ) {
    try {
      const query = `
      SELECT j.*
      FROM user_robot_jobs j,
           user_robots ur
      WHERE j.user_robot_id = ur.id
        AND ur.status NOT IN ('stopped',
                              'paused')
        AND j.created_at <= :date
      ORDER BY created_at;
  ;`;

      const rawData = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT,
        replacements: ctx.params
      });
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0)
        return [];
      const data = underscoreToCamelCaseKeys(rawData);
      return data;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async upsert(ctx: Context<{ entity: cpz.UserRobotJob }>) {
    try {
      const { userRobotId, type, data }: cpz.UserRobotJob = ctx.params.entity;
      const value = Object.values({
        userRobotId,
        type,
        data: JSON.stringify(data)
      });
      const query = `INSERT INTO user_robot_jobs
     (  
        user_robot_id,
        type,
        data
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT user_robot_jobs_user_robot_id_type_data_key 
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

export = UserRobotJobsService;
