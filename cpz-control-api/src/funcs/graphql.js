import { ApolloServer } from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import typeDefs from "../api/schema/schema.graphql";

// A map of functions which return data for the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Datetime: GraphQLDateTime,
  Query: {
    ping: () => new Date().toISOString()
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

export default server.createHandler();
