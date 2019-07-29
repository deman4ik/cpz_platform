import { ServiceSchema } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "moleculer-db-adapter-sequelize";
import Sequelize from "sequelize";
import { cpz } from "../../types/cpz";

const ImportersService: ServiceSchema = {
  name: cpz.Service.DB_IMPORTERS,
  mixins: [DbService],
  adapter: new SqlAdapter(
    process.env.PG_DBNAME,
    process.env.PG_USER,
    process.env.PG_PWD,
    {
      dialect: "postgres",
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      dialectOptions: {
        ssl: true
      },
      logging: false
    }
  ),
  model: {
    name: "importers",
    define: {
      id: { type: Sequelize.UUID, primaryKey: true },
      exchange: Sequelize.STRING,
      asset: Sequelize.STRING,
      currency: Sequelize.STRING,
      params: Sequelize.JSONB,
      status: Sequelize.STRING,
      startedAt: { type: Sequelize.DATE, allowNull: true, field: "started_at" },
      endedAt: { type: Sequelize.DATE, allowNull: true, field: "ended_at" },
      error: { type: Sequelize.JSONB, allowNull: true }
    },
    options: {
      freezeTableName: true,
      timestamps: false
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
            startedAt: {
              type: "string",
              optional: true
            },
            endedAt: {
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
      async handler(ctx) {
        try {
          const {
            id,
            exchange,
            asset,
            currency,
            type,
            params,
            status,
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
            started_at: startedAt,
            ended_at: endedAt,
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
          throw e;
        }
      }
    }
  }
};

export = ImportersService;
