import { ApolloServer } from "apollo-server-azure-functions";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import typeDefs from "../api/schema/schema.graphql";
import mutations from "../api/resolvers/mutations";

/*
import PostgreAPI from "../api/datasources/postgre";
const dataSources = () => ({
  // TODO: dataSources
  dbAPI: new PostgreAPI(db)
});

const context = async ({ req }) => {
  // TODO: Read headers
  const user = {};
  return { user };
};
*/
// A map of functions which return data for the schema.
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
  context: ctx => ({
    context: ctx.context
  })
});

export default server.createHandler();
