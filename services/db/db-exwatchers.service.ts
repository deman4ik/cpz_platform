import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../types/cpz";

class ExwatchersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_EXWATCHERS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "exwatchers",
        define: {
          id: { type: Sequelize.STRING, primaryKey: true },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          status: Sequelize.STRING,
          node_id: { type: Sequelize.STRING },
          importer_id: {
            type: Sequelize.UUID,
            allowNull: true
          },
          error: { type: Sequelize.JSONB, allowNull: true }
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
                exchange: "string",
                asset: "string",
                currency: "string",
                status: "string",
                node_id: "string",
                importer_id: { type: "string", optional: true },
                error: {
                  type: "object",
                  optional: true
                }
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
        exchange,
        asset,
        currency,
        status,
        node_id,
        importer_id,
        error
      }: cpz.Exwatcher = ctx.params.entity;
      const value = Object.values({
        id,
        exchange,
        asset,
        currency,
        status,
        node_id,
        importer_id,
        error: JSON.stringify(error)
      });
      const query = `INSERT INTO exwatchers 
        ( id, 
          exchange,
          asset,
          currency,
          status,
          node_id,
          importer_id, 
          error
        ) 
        VALUES (?)
         ON CONFLICT ON CONSTRAINT exwatchers_pkey 
         DO UPDATE SET status = excluded.status,
         importer_id = excluded.importer_id,
         error = excluded.error;`;

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

export = ExwatchersService;
