import {
  ApolloServer,
  AuthenticationError
} from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import typeDefs from "../api/schema/schema.graphql";
import queries from "../api/resolvers/queries";
import mutations from "../api/resolvers/mutations";

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
