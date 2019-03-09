import "babel-polyfill";
import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import VError from "verror";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { checkEnvVars } from "cpzUtils/environment";
import controlEnv from "cpzEnv/control";
import Log from "cpzLog";
import { CONTROL_SERVICE } from "cpzServices";
import typeDefs from "../api/schema/schema.graphql";
import mutations from "../api/resolvers/mutations";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: CONTROL_SERVICE
});
checkEnvVars(controlEnv.variables);

const resolvers = {
  JSON: GraphQLJSON,
  Datetime: GraphQLDateTime,
  Query: {
    ping: () => new Date().toISOString()
  },
  Mutation: mutations
};

const server = new ApolloServer({
  playground: true,
  introspection: true,
  typeDefs,
  resolvers,
  formatError: error => {
    const err = new VError(
      { name: "ConnectorError", cause: error },
      "Failed to process request"
    );
    Log.exception(err);
    // TODO format with ServiceError
    return error;
    // Or, you can delete the exception information
    // delete error.extensions.exception;
    // return error;
  },
  context: req => {
    Log.addContext(req.context);
    if (req.request.headers["api-key"] !== process.env.API_KEY)
      throw new AuthenticationError("Invalid API Key");
    return {
      apiKey: req.request.headers["api-key"],
      context: req.context
    };
  }
});
// TODO: Разобраться с middleware ПОСЛЕ выполнения ресолверов
// TODO: Log.clearContext();
// TODO: Log.request(req,res);
export default server.createHandler();
