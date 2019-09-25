import SqlAdapter from "moleculer-db-adapter-sequelize";
require("pg").types.setTypeParser(1114, (stringValue: string) => {
  return new Date(stringValue + "+0000");
  // e.g., UTC offset. Use any offset that you would like.
});
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
