import { ServiceSchema } from "moleculer";
import { GraphQLClient } from "graphql-request";

const DBClient: ServiceSchema = {
  name: "",

  /**
   * Service created lifecycle event handler
   */
  created() {
    this.DB = new GraphQLClient(process.env.DB_ENDPOINT, {
      headers: {
        "X-Hasura-Admin-Secret": process.env.DB_KEY
      }
    });
  }
};

export = DBClient;
