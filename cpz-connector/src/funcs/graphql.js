import "babel-polyfill";
import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { checkEnvVars } from "cpzUtils/environment";
import connectorEnv from "cpzEnv/connector";
import typeDefs from "../api/schema/schema.graphql";
import queries from "../api/resolvers/queries";
import mutations from "../api/resolvers/mutations";

checkEnvVars(connectorEnv.variables);

const resolvers = {
  JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Query: queries,
  Mutation: mutations
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => {
    if (req.request.headers["api-key"] !== process.env.API_KEY)
      throw new AuthenticationError("Invalid API Key");
    return {
      apiKey: req.request.headers["api-key"],
      context: req.context
    };
  }
});

export default server.createHandler();
