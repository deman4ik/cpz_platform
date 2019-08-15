import SqlAdapter from "moleculer-db-adapter-sequelize";

const adapter = new SqlAdapter(
  process.env.PG_DBNAME,
  process.env.PG_USER,
  process.env.PG_PWD,
  {
    dialect: "postgres",
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialectOptions: {
      ssl: true,
      useUTC: true
    },
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 20000,
      idle: 20000
    }
  }
);

export default adapter;
