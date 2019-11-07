import { Service, ServiceBroker, Context } from "moleculer";
import ApiGateway from "moleculer-web";
import { ApolloService } from "moleculer-apollo-server";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import { cpz } from "../@types";
import Auth from "../mixins/auth";
class ApiService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.API,

      mixins: [
        ApiGateway,
        Auth,
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
            onBeforeCall: this.checkAuth
            // authorization: true
          },

          // https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
          serverOptions: {
            tracing: true,
            playground: true,
            introspection: true,
            engine: {
              apiKey: process.env.ENGINE_API_KEY
            },
            formatError: (err: any) => {
              this.logger.info(err.message, err.code, err.type, err.data);
              // return new Error("Custom Error");
              return err;
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
              "POST register": `${cpz.Service.AUTH}.register`,
              "GET nodes": `${cpz.Service.API}.nodesList`
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
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.getNodesList
        },
        servicesList: {
          graphql: {
            query: `servicesList: JSON!`
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
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

  async checkAuth(
    ctx: Context<
      any,
      {
        user?: cpz.User | { roles: cpz.UserRolesList };
      }
    >,
    route: any,
    req: any
  ) {
    let authValue = req.headers["authorization"];
    if (authValue && authValue.startsWith("Bearer ")) {
      try {
        let token = authValue.slice(7);
        const decoded: {
          userId: string;
          defaultRole: string;
          allowedRoles: string[];
        } = await ctx.call(`${cpz.Service.AUTH}.verifyToken`, {
          token
        });
        const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
          id: decoded.userId
        });
        ctx.meta.user = user;
      } catch (e) {
        this.logger.warn(e);
        ctx.meta.user = {
          roles: {
            allowedRoles: [cpz.UserRoles.anonymous],
            defaultRole: cpz.UserRoles.anonymous
          }
        };
      }
    } else {
      ctx.meta.user = {
        roles: {
          allowedRoles: [cpz.UserRoles.anonymous],
          defaultRole: cpz.UserRoles.anonymous
        }
      };
    }
    this.logger.info(ctx.meta.user);
  }
  /**
   * Authorize the request
   *
   * @param {Context} ctx
   * @param {Object} route
   * @param {IncomingRequest} req
   * @returns {Promise}
   */
  async authorize(
    ctx: Context<
      any,
      {
        user?: cpz.User | { roles: cpz.UserRolesList };
      }
    >,
    route: any,
    req: any
  ) {
    let authValue = req.headers["authorization"];
    if (authValue && authValue.startsWith("Bearer ")) {
      try {
        let token = authValue.slice(7);
        const decoded: {
          userId: string;
          defaultRole: string;
          allowedRoles: string[];
        } = await ctx.call(`${cpz.Service.AUTH}.verifyToken`, {
          token
        });
        if (
          route.opts.roles &&
          Array.isArray(route.opts.roles) &&
          !route.opts.roles.some((r: string) =>
            decoded.allowedRoles.includes(r)
          )
        )
          throw new ApiGateway.Errors.ForbiddenError("FORBIDDEN", null);

        const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
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
