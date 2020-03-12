import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import adapterOptions from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class ConnectorJobsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_CONNECTOR_JOBS,
      mixins: [DbService],
      adapter: new SqlAdapter(
        process.env.PG_DBNAME,
        process.env.PG_USER,
        process.env.PG_PWD,
        adapterOptions
      ),
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
        getUserExAccsWithJobs: {
          handler: this.getUserExAccsWithJobs
        }
      }
    });
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
