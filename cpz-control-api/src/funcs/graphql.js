import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { checkEnvVars } from "cpzUtils/environment";
import controlEnv from "cpzEnv/control";
import typeDefs from "../api/schema/schema.graphql";
import mutations from "../api/resolvers/mutations";

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
