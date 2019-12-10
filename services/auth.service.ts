import { Service, ServiceBroker, Context, Errors } from "moleculer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cpz } from "../@types";
import { v4 as uuid } from "uuid";
import Auth from "../mixins/auth";
import { getAccessValue } from "../utils";

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
          graphql: "login(email: String!, password: String!):AuthResponse!",
          params: {
            email: { type: "email" },
            password: { type: "string" }
          },
          handler: this.login
        },
        register: {
          graphql: "register(email: String!, password: String!):Response!",
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
        me: {
          graphql: "me:UserResponse!",
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
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
    this.logger.info("Login", ctx.params);
    try {
      const { email, password } = ctx.params;
      const [user]: cpz.User[] = await this.broker.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      this.logger.info(user);
      if (!user) throw new Errors.MoleculerClientError("User not found");
      if (user.status === cpz.UserStatus.blocked)
        throw new Errors.MoleculerClientError("User is blocked");
      const passwordChecked = bcrypt.compareSync(password, user.passwordHash);

      if (!passwordChecked)
        throw new Errors.MoleculerClientError("Invalid password", 401);
      const accessToken = this.generateToken(user);
      //TODO: refreashtoken
      const refreshToken = "NOT IMPLEMENTED";
      return {
        success: true,
        accessToken,
        refreshToken
      };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e
      };
    }
  }

  async register(ctx: Context<{ email: string; password: string }>) {
    this.logger.info("Register", ctx.params);
    try {
      const { email, password } = ctx.params;
      //TODO: check password
      const [userExists]: cpz.User[] = await this.broker.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      if (userExists)
        throw new Errors.MoleculerClientError("User already exists");
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
      await this.broker.call(`${cpz.Service.DB_USERS}.insert`, {
        entity: newUser
      });
      return { success: true, result: newUser.id };
    } catch (e) {
      this.logger.error(e);
      return {
        success: false,
        error: e
      };
    }
  }

  async registerTg(
    ctx: Context<{ telegramId: number; telegramUsername: string; name: string }>
  ) {
    this.logger.info("Register Telegram", ctx.params);
    const { telegramId, telegramUsername, name } = ctx.params;
    //TODO: check password
    const [userExists]: cpz.User[] = await this.broker.call(
      `${cpz.Service.DB_USERS}.find`,
      {
        query: { telegramId }
      }
    );
    if (userExists) return { id: userExists.id };
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
    await this.broker.call(`${cpz.Service.DB_USERS}.insert`, {
      entity: newUser
    });
    return { id: newUser.id };
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

  generateToken(user: cpz.User) {
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
      process.env.JWT_SECRET
    );
  }
}

export = AuthService;
