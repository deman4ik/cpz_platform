import { Service, ServiceBroker, Context, Errors } from "moleculer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cpz } from "../@types";
import { v4 as uuid } from "uuid";

class AuthService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.AUTH,
      dependencies: [`${cpz.Service.DB_USERS}`],
      actions: {
        login: {
          rest: "/login",
          params: {
            email: { type: "email" },
            password: { type: "string" }
          },
          handler: this.login
        },
        register: {
          rest: "/register",
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
        getCurrentUser: {
          handler: this.getCurrentUser
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
    return this.generateToken(user);
  }

  async register(ctx: Context<{ email: string; password: string }>) {
    this.logger.info("Register", ctx.params);
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
      settings: {}
    };
    await this.broker.call(`${cpz.Service.DB_USERS}.insert`, {
      entity: newUser
    });
    return { id: newUser.id };
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
      settings: {}
    };
    await this.broker.call(`${cpz.Service.DB_USERS}.insert`, {
      entity: newUser
    });
    return { id: newUser.id };
  }

  getCurrentUser(ctx: Context<null, { user: cpz.User }>) {
    const { id, name, email, telegramId, settings, roles } = ctx.meta.user;
    return {
      id,
      name,
      email,
      telegramId,
      settings
    };
  }

  verifyToken(ctx: Context) {
    return jwt.verify(ctx.params.token, process.env.JWT_SECRET);
  }

  generateToken(user: cpz.User) {
    const {
      id,
      roles: { defaultRole, allowedRoles }
    } = user;
    return jwt.sign(
      {
        userId: id,
        role: defaultRole,
        allowedRoles: allowedRoles,
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": defaultRole,
          "x-hasura-allowed-roles": allowedRoles,
          "x-hasura-user-id": id
        }
      },
      process.env.JWT_SECRET
    );
  }
}

export = AuthService;
