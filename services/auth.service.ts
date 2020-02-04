import { Service, ServiceBroker, Context, Errors } from "moleculer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cpz } from "../@types";
import { v4 as uuid } from "uuid";
import Auth from "../mixins/auth";
import { getAccessValue } from "../utils";
import dayjs from "../lib/dayjs";

class AuthService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.AUTH,
      dependencies: [`${cpz.Service.DB_USERS}`],
      mixins: [Auth],
      settings: {
        graphql: {
          type: `
          type AuthResponse {
            success: Boolean!
            accessToken: String
            refreshToken: String
            error: JSON
          }
          type UserResponse {
            id: String!
            name: String!
            email: String!
            telegramId: Int
            settings: JSON!
          }
          `
        }
      },
      actions: {
        login: {
          params: {
            email: { type: "email" },
            password: { type: "string" }
          },
          handler: this.login
        },
        register: {
          params: {
            email: { type: "email" },
            password: { type: "string" }
          },
          handler: this.register
        },
        registerTg: {
          params: {
            telegramId: "number",
            telegramUsername: "string",
            name: { type: "string", optional: true }
          },
          handler: this.registerTg
        },
        refreshToken: {
          params: {
            refreshToken: "string"
          },
          handler: this.refreshToken
        },
        me: {
          graphql: { query: "me:UserResponse!" },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: this.authAction
          },
          handler: this.me
        },
        verifyToken: {
          params: {
            token: "string"
          },
          handler: this.verifyToken
        }
      }
    });
  }

  async login(ctx: Context<{ email: string; password: string }>) {
    try {
      const { email, password } = ctx.params;
      const [user]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      if (!user) throw new Error("User not found");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User is blocked");
      const passwordChecked = bcrypt.compareSync(password, user.passwordHash);
      if (!passwordChecked) throw new Error("Invalid password");

      let refreshToken;
      let refreshTokenExpireAt;
      if (
        !user.refreshToken ||
        !user.refreshTokenExpireAt ||
        dayjs.utc(user.refreshTokenExpireAt).valueOf() < dayjs.utc().valueOf()
      ) {
        refreshToken = uuid();
        refreshTokenExpireAt = dayjs
          .utc()
          .add(+process.env.REFRESH_TOKEN_EXPIRES, cpz.TimeUnit.minute)
          .toISOString();
        await ctx.call(`${cpz.Service.DB_USERS}.update`, {
          id: user.id,
          refreshToken,
          refreshTokenExpireAt
        });
      } else {
        refreshToken = user.refreshToken;
        refreshTokenExpireAt = user.refreshTokenExpireAt;
      }

      return {
        accessToken: this.generateAccessToken(user),
        accessTokenExpireAt: dayjs
          .utc()
          .add(+process.env.JWT_TOKEN_EXPIRES, cpz.TimeUnit.minute)
          .toISOString(),
        refreshToken,
        refreshTokenExpireAt,
        userId: user.id
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async refreshToken(ctx: Context<{ refreshToken: string }>) {
    try {
      const { refreshToken } = ctx.params;
      const [user]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: {
            refreshToken,
            refreshTokenExpireAt: {
              $gt: dayjs.utc().toISOString()
            }
          }
        }
      );
      if (!user) throw new Error("Refresh token expired or user not found");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User is blocked");

      return {
        accessToken: this.generateAccessToken(user),
        accessTokenExpireAt: dayjs
          .utc()
          .add(+process.env.JWT_TOKEN_EXPIRES, cpz.TimeUnit.minute)
          .toISOString(),
        refreshToken: user.refreshToken,
        refreshTokenExpireAt: user.refreshTokenExpireAt,
        userId: user.id
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async register(ctx: Context<{ email: string; password: string }>) {
    try {
      const { email, password } = ctx.params;

      const [userExists]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      if (userExists) throw new Error("User already exists");
      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser: cpz.User = {
        id: uuid(),
        email,
        status: cpz.UserStatus.enabled,
        passwordHash,
        roles: {
          allowedRoles: [cpz.UserRoles.user],
          defaultRole: cpz.UserRoles.user
        },
        settings: {
          notifications: {
            signals: {
              telegram: false,
              email: true
            },
            trading: {
              telegram: false,
              email: true
            }
          }
        }
      };
      await ctx.call(`${cpz.Service.DB_USERS}.insert`, {
        entity: newUser
      });
      return newUser.id;
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async registerTg(
    ctx: Context<{ telegramId: number; telegramUsername: string; name: string }>
  ) {
    this.logger.info("Register Telegram", ctx.params);
    const { telegramId, telegramUsername, name } = ctx.params;

    const [userExists]: cpz.User[] = await ctx.call(
      `${cpz.Service.DB_USERS}.find`,
      {
        query: { telegramId }
      }
    );
    if (userExists) return userExists;
    const newUser: cpz.User = {
      id: uuid(),
      telegramId,
      telegramUsername,
      name,
      status: cpz.UserStatus.enabled,
      roles: {
        allowedRoles: [cpz.UserRoles.user],
        defaultRole: cpz.UserRoles.user
      },
      settings: {
        notifications: {
          signals: {
            telegram: true,
            email: false
          },
          trading: {
            telegram: true,
            email: false
          }
        }
      }
    };
    await ctx.call(`${cpz.Service.DB_USERS}.insert`, {
      entity: newUser
    });
    return newUser;
  }

  me(ctx: Context<null, { user: cpz.User }>) {
    const { id, name, email, telegramId, settings, roles } = ctx.meta.user;
    return {
      id,
      name,
      email,
      telegramId,
      settings
    };
  }

  verifyToken(
    ctx: Context<{
      token: string;
    }>
  ) {
    return jwt.verify(ctx.params.token, process.env.JWT_SECRET);
  }

  generateAccessToken(user: cpz.User) {
    const {
      id,
      roles: { defaultRole, allowedRoles }
    } = user;
    const access = getAccessValue(user);
    return jwt.sign(
      {
        userId: id,
        role: defaultRole,
        allowedRoles: allowedRoles,
        access,
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": defaultRole,
          "x-hasura-allowed-roles": allowedRoles,
          "x-hasura-user-id": id,
          "x-hasura-access": access
        }
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: `${process.env.JWT_TOKEN_EXPIRES}m`
      }
    );
  }
}

export = AuthService;
