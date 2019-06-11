import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import { checkEnvVars } from "cpz/utils/environment";
import connectorEnv from "cpz/config/environment/connector";
import typeDefs from "../api/schema/schema.graphql";
import queries from "../api/resolvers/queries";
import mutations from "../api/resolvers/mutations";
import { SERVICE_NAME } from "../config";

class Graphql {
  constructor() {
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(connectorEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    this.run = this.graphqlServer();
  }

  graphqlServer() {
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
        const err = new ServiceError(
          { name: ServiceError.types.CONNECTOR_API_ERROR, cause: error },
          "Failed to process request"
        );
        Log.exception(err);

        return err.json;
        // Or, you can delete the exception information
        // delete error.extensions.exception;
        // return error;
      },
      context: req => {
        Log.addContext(req.context);
        if (req.request.headers["api-key"] !== process.env.API_KEY)
          throw new AuthenticationError("Invalid API Key");
        return {
          context: req.context
        };
      }
    });
    return server.createHandler();
  }
}

const func = new Graphql();

export default func;
