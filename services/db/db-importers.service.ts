import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import { adapterOptions, adapter } from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class ImportersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_IMPORTERS,
      mixins: [DbService],
      adapter,
      model: {
        name: "importers",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          exchange: Sequelize.STRING,
          asset: Sequelize.STRING,
          currency: Sequelize.STRING,
          params: Sequelize.JSONB,
          status: Sequelize.STRING,
          progress: { type: Sequelize.INTEGER, allowNull: true },
          startedAt: {
            type: Sequelize.DATE,
            field: "started_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("startedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          endedAt: {
            type: Sequelize.DATE,
            field: "ended_at",
            allowNull: true,
            get: function() {
              const value = this.getDataValue("endedAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          error: { type: Sequelize.STRING, allowNull: true }
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
                progress: { type: "number", integer: true, optional: true },
                startedAt: {
                  type: "string",
                  optional: true
                },
                endedAt: {
                  type: "string",
                  optional: true
                },
                error: {
                  type: "string",
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

  async upsert(ctx: Context<{ entity: cpz.Importer }>) {
    try {
      const {
        id,
        exchange,
        asset,
        currency,
        type,
        params,
        status,
        progress,
        startedAt,
        endedAt,
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
        progress,
        startedAt,
        endedAt,
        error
      });
      const query = `INSERT INTO importers 
    (id, exchange, asset, currency, type, params, status, progress, started_at, ended_at, error) 
    VALUES (?)
     ON CONFLICT ON CONSTRAINT importers_pkey 
     DO UPDATE SET updated_at = now(),
     status = excluded.status,
     progress = excluded.progress,
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
      throw e;
    }
  }
}

export = ImportersService;
