import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../types/cpz";

class ImportersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_IMPORTERS,
      mixins: [DbService],
      adapter: SqlAdapter,
      model: {
        name: "importers",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          params: Sequelize.JSONB,
          status: Sequelize.STRING,
          started_at: { type: Sequelize.DATE, allowNull: true },
          ended_at: { type: Sequelize.DATE, allowNull: true },
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
                type: "string",
                params: "object",
                status: "string",
                started_at: {
                  type: "string",
                  optional: true
                },
                ended_at: {
                  type: "string",
                  optional: true
                },
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
        type,
        params,
        status,
        started_at,
        ended_at,
        error
      }: cpz.Importer = ctx.params.entity;
      const value = Object.values({
        id,
        exchange,
        asset,
        currency,
        type,
        params: JSON.stringify(params),
        status,
        started_at,
        ended_at,
        error: JSON.stringify(error)
      });
      const query = `INSERT INTO importers 
    (id, exchange, asset, currency, type, params, status, started_at, ended_at, error) 
    VALUES (?)
     ON CONFLICT ON CONSTRAINT importers_pkey 
     DO UPDATE SET status = excluded.status,
     started_at = excluded.started_at,
     ended_at = excluded.ended_at,
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

export = ImportersService;
