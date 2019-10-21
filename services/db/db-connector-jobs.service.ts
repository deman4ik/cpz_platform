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
          type: Sequelize.STRING,
          orderId: { type: Sequelize.JSONB, field: "order_id" }
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
                type: "string",
                orderId: "string"
              }
            }
          },
          handler: this.upsert
        }
      }
    });
  }

  async upsert(ctx: Context<{ entity: cpz.ConnectorJob }>) {
    try {
      const { userExAccId, type, orderId } = ctx.params.entity;
      const value = Object.values({
        userExAccId,
        type,
        orderId
      });
      const query = `INSERT INTO connector_jobs
     (  
        user_ex_acc_id,
        type,
        order_id
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT connector_jobs_user_ex_acc_id_order_id_key 
         DO UPDATE SET updated_at = now(),
         type = excluded.type`;

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

export = ConnectorJobsService;
