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

  async upsert(ctx: Context<{ entity: cpz.ConnectorJob }>) {
    try {
      const { userExAccId, type, data } = ctx.params.entity;
      const value = Object.values({
        userExAccId,
        type,
        data
      });
      const query = `INSERT INTO connector_jobs
     (  
        user_ex_acc_id,
        type,
        data
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT connector_jobs_user_ex_acc_id_type_key 
         DO NOTHING`;

      await this.adapter.db.query(query, {
        type: Sequelize.QueryTypes.INSERT,
        replacements: [value]
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      throw new Errors.MoleculerError(e.message, 500, `ERR_${this.name}`, e);
    }
  }
}

export = ConnectorJobsService;
