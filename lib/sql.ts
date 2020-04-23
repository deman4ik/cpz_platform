import { Op } from "sequelize";
import SqlAdapter from "moleculer-db-adapter-sequelize";

require("pg").types.setTypeParser(1114, (stringValue: string) => {
  return new Date(stringValue + "+0000");
  // e.g., UTC offset. Use any offset that you would like.
});

const adapterOptions = {
  dialect: "postgres",
  operatorsAliases: {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
  },
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  dialectOptions: {
    ssl: true,
    useUTC: true
  },
  logging: false,
  pool: {
    min: 0
  }
};

const adapter = new SqlAdapter(
  process.env.PG_DBNAME,
  process.env.PG_USER,
  process.env.PG_PWD,
  adapterOptions
);

export { adapterOptions, adapter };
