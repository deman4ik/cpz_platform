import { Service, ServiceBroker, Context } from "moleculer";
import ApiGateway from "moleculer-web";
import { ApolloService } from "moleculer-apollo-server";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";

class ApiService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: "api",

      mixins: [
        ApiGateway,
        ApolloService({
          // Global GraphQL typeDefs
          typeDefs: [
            `scalar Datetime`,
            `scalar JSON`,
            `type Response {
              success: Boolean!
              result: JSON
              error: JSON
            }`,
            ` 
    type ServiceStatus {
      success: Boolean!
      id: ID!
      status: String
      error: JSON
    }`
          ],

          // Global resolvers
          resolvers: {
            JSON: GraphQLJSON,
            Datetime: GraphQLDateTime
          },

          // API Gateway route options
          routeOptions: {
            path: "/graphql",
            cors: true,
            mappingPolicy: "restrict"
          },

          // https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
          serverOptions: {
            tracing: true,
            playground: true,
            introspection: true,
            engine: {
              apiKey: process.env.ENGINE_API_KEY
            }
          }
        })
      ],
      settings: {
        port: process.env.PORT || 3000,
        routes: [
          {
            path: "/api",
            whitelist: [
              // Access to any actions in all services under "/api" URL
              "**"
            ]
          }
        ],

        // Serve assets from "public" folder
        assets: {
          folder: "public"
        }
      },
      actions: {
        nodesList: {
          graphql: {
            query: `nodesList: JSON!`
          },
          handler: this.getNodesList
        },
        servicesList: {
          graphql: {
            query: `servicesList: JSON!`
          },
          handler: this.getServicesList
        }
      }
    });
  }

  async getNodesList(ctx: Context) {
    return await this.broker.call("$node.list");
  }

  async getServicesList(ctx: Context) {
    return await this.broker.call("$node.services");
  }
}

export = ApiService;
