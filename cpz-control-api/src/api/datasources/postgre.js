import { DataSource } from "apollo-datasource";

class DB extends DataSource {
  constructor({ db }) {
    super();
    this.db = db;
  }

  /* initialize(config) {
    this.context = config.context;
  } */

  async getUserRobot({ id }) {
    return this.db.getUserRobot({ id });
  }
}

export default DB;
