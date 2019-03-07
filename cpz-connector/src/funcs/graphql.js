import "babel-polyfill";
import VError from "verror";
import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { checkEnvVars } from "cpzUtils/environment";
import connectorEnv from "cpzEnv/connector";
import Log from "cpzLog";
import { CONNECTOR_SERVICE } from "cpzServices";
import typeDefs from "../api/schema/schema.graphql";
import queries from "../api/resolvers/queries";
import mutations from "../api/resolvers/mutations";

Log.config({
  key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  serviceName: CONNECTOR_SERVICE
});
checkEnvVars(connectorEnv.variables);

const resolvers = {
  JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Query: queries,
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
    if (req.request.headers["api-key"] !== process.env.API_KEY) {
      const authError = new AuthenticationError("Invalid API Key");
      Log.exception(authError);
      throw authError;
    }
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
