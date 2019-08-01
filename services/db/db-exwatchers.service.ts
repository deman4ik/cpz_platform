import { ServiceSchema, Errors } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../types/cpz";

const ExwatchersService: ServiceSchema = {
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
      nodeId: { type: Sequelize.STRING, field: "node_id" },
      importerId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: "importer_id"
      },
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
            status: "string",
            nodeId: "string",
            importerId: "string",
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
            status,
            nodeId,
            importerId,
            error
          }: cpz.Exwatcher = ctx.params.entity;
          const value = Object.values({
            id,
            exchange,
            asset,
            currency,
            status,
            nodeId,
            importerId,
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
          throw new Errors.MoleculerRetryableError(
            e.message,
            500,
            this.name,
            e
          );
        }
      }
    }
  }
};

export = ExwatchersService;
