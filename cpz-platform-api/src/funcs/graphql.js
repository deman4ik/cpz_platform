import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import ServiceError from "cpz/error";
import Log from "cpz/log";
import Mailer from "cpz/mailer";
import BaseService from "cpz/services/baseService";
import { checkEnvVars } from "cpz/utils/environment";
import ApiEnv from "cpz/config/environment/api";
import DB from "cpz/db-client";
import ConnectorClient from "cpz/connector-client";
import { SERVICE_NAME } from "../config";
import typeDefs from "../api/schema/schema.graphql";
import mutations from "../api/resolvers/mutations";

class Graphql extends BaseService {
  constructor() {
    super();
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(ApiEnv);
    // Configure Logger
    Log.config({
      key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    DB.init(process.env.DB_API_ENDPOINT, process.env.DB_API_ACCESS_KEY);
    // Configure Connector Client
    ConnectorClient.init(
      process.env.CONNECTOR_API_ENDPOINT,
      process.env.CONNECTOR_API_KEY
    );
    Mailer.init({
      apiKey: process.env.MAILGUN_API,
      domain: process.env.MAILGUN_DOMAIN
    });
    this.run = this.graphqlServer();
  }

  graphqlServer() {
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
        const err = new ServiceError(
          { name: ServiceError.types.CONTROL_API_ERROR, cause: error },
          "Failed to process request"
        );
        Log.exception(err);

        return err.json;
        // Or, you can delete the exception information
        // delete error.extensions.exception;
        // return error;
      },
      context: req => {
        req.context.log(req.request);
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
