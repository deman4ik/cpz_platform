import { Service, ServiceBroker, Context } from "moleculer";
import ApiGateway from "moleculer-web";
import { ApolloService } from "moleculer-apollo-server";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { cpz } from "../types/cpz";

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
            mappingPolicy: "restrict",
            authorization: true
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
            aliases: {
              "POST login": `${cpz.Service.AUTH}.login`,
              "POST register": `${cpz.Service.AUTH}.register`
            }
          },
          {
            path: "/api/auth",
            roles: [cpz.UserRoles.user, cpz.UserRoles.admin],
            aliases: {
              "GET me": `${cpz.Service.AUTH}.getCurrentUser`
            },
            authorization: true
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

  /**
   * Authorize the request
   *
   * @param {Context} ctx
   * @param {Object} route
   * @param {IncomingRequest} req
   * @returns {Promise}
   */
  async authorize(ctx: Context, route: any, req: any) {
    let authValue = req.headers["authorization"];
    if (authValue && authValue.startsWith("Bearer ")) {
      try {
        let token = authValue.slice(7);
        const decoded = await ctx.call(`${cpz.Service.AUTH}.verifyToken`, {
          token
        });
        if (
          route.opts.roles &&
          Array.isArray(route.opts.roles) &&
          route.opts.roles.indexOf(decoded.role) === -1
        )
          throw new ApiGateway.Errors.ForbiddenError("FORBIDDEN", null);

        const user = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
          id: decoded.userId
        });
        ctx.meta.user = user;
        this.logger.info("Logged in user", user);
      } catch (e) {
        this.logger.error(e);
        if (e instanceof ApiGateway.Errors.ForbiddenError) {
          throw e;
        }
        throw new ApiGateway.Errors.UnAuthorizedError(
          ApiGateway.Errors.ERR_INVALID_TOKEN,
          e
        );
      }
    } else {
      throw new ApiGateway.Errors.UnAuthorizedError(
        ApiGateway.Errors.ERR_NO_TOKEN,
        null
      );
    }
  }
}

export = ApiService;
