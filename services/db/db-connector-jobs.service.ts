import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";

class ConnectorJobsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_CONNECTOR_JOBS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "connector_jobs",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          userExAccId: { type: Sequelize.UUID, field: "user_ex_acc_id" },
          orderId: { type: Sequelize.UUID, field: "order_id" },
          nextJobAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "next_job_at",
            get: function() {
              const value = this.getDataValue("nextJobAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          priority: Sequelize.INTEGER,
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
                userExAccId: "string",
                orderId: "string",
                type: "string",
                priority: { type: "number", integer: true },
                nextJobAt: "string",
                data: { type: "object", optional: true }
              }
            }
          },
          handler: this.upsert
        },
        getUserExAccsWithJobs: {
          handler: this.getUserExAccsWithJobs
        }
      }
    });
  }

  async upsert(ctx: Context<{ entity: cpz.ConnectorJob }>) {
    try {
      const {
        userExAccId,
        type,
        orderId,
        priority,
        nextJobAt,
        data
      } = ctx.params.entity;
      const value = Object.values({
        userExAccId,
        orderId,
        type,
        priority,
        nextJobAt,
        data: JSON.stringify(data)
      });
      const query = `INSERT INTO connector_jobs
     (  
        user_ex_acc_id,
        order_id,
        type,
        priority,
        next_job_at,
        data
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT connector_jobs_order_id_type_key 
         DO NOTHING`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: [value]
      });
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerError(e.message, 500, `ERR_${this.name}`, e);
    }
  }

  async getUserExAccsWithJobs(ctx: Context): Promise<string[]> {
    try {
      const query = `SELECT j.user_ex_acc_id
      FROM connector_jobs j,
           user_exchange_accs a
      WHERE j.user_ex_acc_id = a.id
        AND a.status = 'enabled'
        AND j.next_job_at IS NOT NULL
        AND j.next_job_at <= now()
      GROUP BY j.user_ex_acc_id`;
      const rawData = await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.SELECT
      });
      if (rawData && Array.isArray(rawData) && rawData.length > 0)
        return rawData.map((d: { user_ex_acc_id: string }) => d.user_ex_acc_id);
      return [];
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = ConnectorJobsService;
