import { Service, ServiceBroker, Context } from "moleculer";
import ApiGateway from "moleculer-web";
import { ApolloService } from "moleculer-apollo-server";
import GraphQLJSON from "graphql-type-json";
import { GraphQLDateTime } from "graphql-iso-date";
import Cookies from "cookies";
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
            mappingPolicy: "restrict",
            cors: {
              origin: [
                "*.cryptuoso.com",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://0.0.0.0:3000",
                "http://0.0.0.0:3001",
                "localhost"
              ],
              methods: ["POST"],
              credentials: true
            },
            aliases: {
              "POST /auth/login": this.login,
              "POST /auth/register": this.register,
              "POST /auth/refresh-token": this.refreshToken
            }
          }
        ],
        whitelist: [],
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
          handler: this.getNodesList
        },
        servicesList: {
          graphql: {
            query: `servicesList: JSON!`
          },
          roles: [cpz.UserRoles.admin],
          handler: this.getServicesList
        }
      }
    });
  }

  async login(req: any, res: any) {
    try {
      const {
        accessToken,
        accessTokenExpireAt,
        refreshToken,
        refreshTokenExpireAt,
        userId
      } = await req.$service.broker.call(`${cpz.Service.AUTH}.login`, req.body);

      const cookies = new Cookies(req, res);

      cookies.set("refresh_token", refreshToken, {
        expires: new Date(refreshTokenExpireAt),
        httpOnly: true,
        sameSite: true,
        overwrite: true
      });
      res.end(
        JSON.stringify({
          success: true,
          accessToken,
          accessTokenExpireAt,
          userId
        })
      );
    } catch (e) {
      this.logger.warn(e);
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  async register(req: any, res: any) {
    try {
      const userId = await req.$service.broker.call(
        `${cpz.Service.AUTH}.register`,
        req.body
      );
      res.end(JSON.stringify({ success: true, userId }));
    } catch (e) {
      this.logger.warn(e);
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  async registerTelegram(req: any, res: any) {
    try {
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      this.logger.warn(e);
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  async refreshToken(req: any, res: any) {
    try {
      const cookies = new Cookies(req, res);
      const oldRefreshToken = cookies.get("refresh_token");
      this.logger.info(req.headers);
      this.logger.info(oldRefreshToken);
      const {
        accessToken,
        accessTokenExpireAt,
        refreshToken,
        refreshTokenExpireAt,
        userId
      } = await req.$service.broker.call(`${cpz.Service.AUTH}.refreshToken`, {
        refreshToken: oldRefreshToken
      });
      cookies.set("refresh_token", refreshToken, {
        expires: new Date(refreshTokenExpireAt),
        httpOnly: true,
        sameSite: true,
        overwrite: true
      });
      res.end(
        JSON.stringify({
          success: true,
          accessToken,
          accessTokenExpireAt,
          userId
        })
      );
    } catch (e) {
      this.logger.warn(e.message, {
        code: e.code,
        type: e.type,
        data: e.data,
        retryable: e.retryable
      });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  async getNodesList(ctx: Context) {
    try {
      this.authAction(ctx);
      return await ctx.call("$node.list");
    } catch (e) {
      return { error: e.message };
    }
  }

  async getServicesList(ctx: Context) {
    try {
      this.authAction(ctx);
      return await ctx.call("$node.services");
    } catch (e) {
      return { error: e.message };
    }
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
  }
}

export = ApiService;
