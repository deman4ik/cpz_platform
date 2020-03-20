import { Service, ServiceBroker, Context, Errors } from "moleculer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cpz } from "../@types";
import { v4 as uuid } from "uuid";
import Auth from "../mixins/auth";
import { getAccessValue } from "../utils";
import dayjs from "../lib/dayjs";
import { formatTgName, checkTgLogin } from "../utils/auth";

class AuthService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.AUTH,
      dependencies: [`${cpz.Service.DB_USERS}`],
      mixins: [Auth],
      actions: {
        login: {
          params: {
            email: { type: "email", lowercase: true, empty: false, trim: true },
            password: { type: "string", empty: false, trim: true }
          },
          handler: this.login
        },
        loginTg: {
          params: {
            id: "number",
            first_name: { type: "string", optional: true },
            last_name: { type: "string", optional: true },
            username: { type: "string", optional: true },
            photo_url: { type: "string", optional: true },
            auth_date: "number",
            hash: "string"
          },
          handler: this.loginTg
        },
        setTg: {
          params: {
            data: {
              type: "object",
              props: {
                id: "number",
                first_name: { type: "string", optional: true },
                last_name: { type: "string", optional: true },
                username: { type: "string", optional: true },
                photo_url: { type: "string", optional: true },
                auth_date: "number",
                hash: "string"
              }
            }
          },
          graphql: {
            mutation: "setTelegram(data: JSON!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.setTg
        },
        changeEmail: {
          params: {
            email: { type: "email", lowercase: true, empty: false, trim: true }
          },
          graphql: {
            mutation: "changeEmail(email: String!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.changeEmail
        },
        confirmChangeEmail: {
          params: {
            secretCode: { type: "string", empty: false, trim: true }
          },
          graphql: {
            mutation: "confirmChangeEmail(secretCode: String!): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.confirmChangeEmail
        },
        changePassword: {
          params: {
            password: {
              type: "string",
              min: 6,
              max: 100,
              alphanum: true,
              trim: true
            },
            oldPassword: { type: "string", optional: true, trim: true }
          },
          graphql: {
            mutation:
              "changePassword(password: String!, oldPassword: String): Response!"
          },
          roles: [cpz.UserRoles.user],
          handler: this.changePassword
        },
        register: {
          params: {
            email: { type: "email", lowercase: true, empty: false, trim: true },
            password: {
              type: "string",
              min: 6,
              max: 100,
              alphanum: true,
              trim: true
            },
            name: { type: "string", optional: true, empty: false, trim: true }
          },
          handler: this.register
        },
        activateAccount: {
          params: {
            userId: "string",
            secretCode: { type: "string", empty: false, trim: true }
          },
          handler: this.activateAccount
        },
        passwordReset: {
          params: {
            email: { type: "email", lowercase: true, empty: false, trim: true }
          },
          handler: this.passwordReset
        },
        confirmPasswordReset: {
          params: {
            userId: "string",
            secretCode: { type: "string", empty: false, trim: true },
            password: {
              type: "string",
              min: 6,
              max: 100,
              alphanum: true,
              trim: true
            }
          },
          handler: this.confirmPasswordReset
        },
        registerTg: {
          params: {
            telegramId: "number",
            telegramUsername: { type: "string", optional: true },
            name: { type: "string", optional: true, empty: false, trim: true }
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
          graphql: { query: "me:Response!" },
          roles: [cpz.UserRoles.user],
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
      if (!user) throw new Error("User account is not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");
      if (user.status === cpz.UserStatus.new)
        throw new Error("User account is not activated.");
      const passwordChecked = await bcrypt.compare(password, user.passwordHash);
      if (!passwordChecked) throw new Error("Invalid password.");

      let refreshToken;
      let refreshTokenExpireAt;
      if (
        !user.refreshToken ||
        !user.refreshTokenExpireAt ||
        dayjs
          .utc(user.refreshTokenExpireAt)
          .add(-1, cpz.TimeUnit.day)
          .valueOf() < dayjs.utc().valueOf()
      ) {
        refreshToken = uuid();
        refreshTokenExpireAt = dayjs
          .utc()
          .add(+process.env.REFRESH_TOKEN_EXPIRES, cpz.TimeUnit.day)
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
        refreshToken,
        refreshTokenExpireAt
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async loginTg(
    ctx: Context<{
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      auth_date: number;
      hash: string;
    }>
  ) {
    try {
      const loginData = await checkTgLogin(ctx.params, process.env.BOT_TOKEN);
      if (!loginData) throw new Error("Invalid login data.");

      const {
        id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username: telegramUsername
      } = loginData;
      const name = formatTgName(telegramUsername, firstName, lastName);

      const user: cpz.User = await this.actions.registerTg(
        {
          telegramId,
          telegramUsername,
          name
        },
        { parentCtx: ctx }
      );
      if (!user) throw new Error("User account is not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");
      if (user.status === cpz.UserStatus.new)
        throw new Error("User account is not activated.");

      let refreshToken;
      let refreshTokenExpireAt;
      if (
        !user.refreshToken ||
        !user.refreshTokenExpireAt ||
        dayjs
          .utc(user.refreshTokenExpireAt)
          .add(-1, cpz.TimeUnit.day)
          .valueOf() < dayjs.utc().valueOf()
      ) {
        refreshToken = uuid();
        refreshTokenExpireAt = dayjs
          .utc()
          .add(+process.env.REFRESH_TOKEN_EXPIRES, cpz.TimeUnit.day)
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
        refreshToken,
        refreshTokenExpireAt
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async setTg(
    ctx: Context<
      {
        data: {
          id: number;
          first_name?: string;
          last_name?: string;
          username?: string;
          photo_url?: string;
          auth_date: number;
          hash: string;
        };
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);

      const loginData = await checkTgLogin(
        ctx.params.data,
        process.env.BOT_TOKEN
      );
      if (!loginData) throw new Error("Invalid login data.");

      const { id: telegramId, username: telegramUsername } = loginData;

      const [userExists]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { telegramId }
        }
      );
      if (userExists)
        throw new Error("User already exists. Try to login with Telegram.");
      const { id: userId } = ctx.meta.user;
      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });
      if (!user) throw new Error("User account is not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");

      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        telegramId,
        telegramUsername,
        status: cpz.UserStatus.enabled
      });

      await ctx.call(`${cpz.Service.DB_USERS}.setNotificationSettings`, {
        signalsTelegram: true,
        tradingTelegram: true
      });

      return { success: true };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async changeEmail(
    ctx: Context<
      {
        email: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);
      const { email } = ctx.params;
      const [userExists]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      if (userExists) throw new Error("User already exists.");
      const { id: userId } = ctx.meta.user;

      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });
      if (!user) throw new Error("User account is not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");

      let secretCode;
      let secretCodeExpireAt;
      if (
        secretCode &&
        secretCodeExpireAt &&
        dayjs.utc().valueOf() < dayjs.utc(secretCodeExpireAt).valueOf()
      ) {
        secretCode = user.secretCode;
        secretCodeExpireAt = user.secretCodeExpireAt;
      } else {
        secretCode = this.generateCode();
        secretCodeExpireAt = dayjs
          .utc()
          .add(1, cpz.TimeUnit.hour)
          .toISOString();
      }
      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        emailNew: email,
        secretCode,
        secretCodeExpireAt
      });

      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: email,
        subject: "🔐 Cryptuoso - Change Email Request.",
        variables: {
          body: `<p>We received a request to change your email.</p>
          <p>Please enter this code <b>${secretCode}</b> to confirm.</p>
          <p>This request will expire in 1 hour.</p>
          <p>If you did not request this change, no changes have been made to your user account.</p>`
        },
        tags: ["auth"]
      });

      return { success: true };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async confirmChangeEmail(
    ctx: Context<{ secretCode: string }, { user: cpz.User }>
  ) {
    try {
      this.authAction(ctx);
      const { secretCode } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });

      if (!user) throw new Error("User account not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");
      if (!user.emailNew) throw new Error("New email is not set.");
      if (!user.secretCode) throw new Error("Confirmation code is not set.");
      if (user.secretCode !== secretCode)
        throw new Error("Wrong confirmation code.");

      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        email: user.emailNew,
        emailNew: null,
        secretCode: null,
        secretCodeExpireAt: null,
        status: cpz.UserStatus.enabled
      });

      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: user.email || user.emailNew,
        subject: "🔐 Cryptuoso - Email Change Confirmation.",
        variables: {
          body: `
            <p>Your email successfully changed to ${user.emailNew}!</p>
            <p>If you did not request this change, please contact support <a href="mailto:support@cryptuoso.com">support@cryptuoso.com</a></p>`
        },
        tags: ["auth"]
      });

      return { success: true };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
  }

  async changePassword(
    ctx: Context<
      {
        password: string;
        oldPassword?: string;
      },
      { user: cpz.User }
    >
  ) {
    try {
      this.authAction(ctx);
      const { password, oldPassword } = ctx.params;
      const { id: userId } = ctx.meta.user;

      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });
      if (!user) throw new Error("User account is not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");

      if (user.passwordHash) {
        if (!oldPassword) throw new Error("Old password is required.");
        const oldChecked = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!oldChecked) throw new Error("Wrong old password.");
      }
      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        passwordHash: await bcrypt.hash(password, 10),
        oldPassword: null
      });

      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: user.email,
        subject: "🔐 Cryptuoso - Change Password Confirmation.",
        variables: {
          body: `
            <p>Your password successfully changed!</p>
            <p>If you did not request this change, please contact support <a href="mailto:support@cryptuoso.com">support@cryptuoso.com</a></p>`
        },
        tags: ["auth"]
      });

      return { success: true };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
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
      if (!user)
        throw new Error("Refresh token expired or user account is not found.");
      if (user.status === cpz.UserStatus.new)
        throw new Error("User account is not activated.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");

      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: user.refreshToken,
        refreshTokenExpireAt: user.refreshTokenExpireAt
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async register(
    ctx: Context<{ email: string; password: string; name?: string }>
  ) {
    try {
      const { email, password, name } = ctx.params;

      const [userExists]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );
      if (userExists) throw new Error("User account already exists");
      const newUser: cpz.User = {
        id: uuid(),
        name,
        email,
        status: cpz.UserStatus.new,
        passwordHash: await bcrypt.hash(password, 10),
        secretCode: this.generateCode(),
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

      const urlData = this.encodeData({
        userId: newUser.id,
        secretCode: newUser.secretCode
      });
      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: email,
        subject:
          "🚀 Welcome to Cryptuoso Platform - Please confirm your email.",
        variables: {
          body: `<p>Greetings!</p>
            <p>Your user account is successfully created!</p>
            <p>Activate your account by confirming your email please click <b><a href="https://cryptuoso.com/auth/activate-account/${urlData}">this link</a></b></p>
            <p>or enter this code <b>${newUser.secretCode}</b> manually on confirmation page.</p>`
        },
        tags: ["auth"]
      });
      return newUser.id;
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async activateAccount(ctx: Context<{ userId: string; secretCode: string }>) {
    try {
      const { userId, secretCode } = ctx.params;

      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });

      if (!user) throw new Error("User account not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");
      if (user.status === cpz.UserStatus.enabled)
        throw new Error("User account is already activated.");
      if (!user.secretCode) throw new Error("Confirmation code is not set.");
      if (user.secretCode !== secretCode)
        throw new Error("Wrong confirmation code.");

      const refreshToken = uuid();
      const refreshTokenExpireAt = dayjs
        .utc()
        .add(+process.env.REFRESH_TOKEN_EXPIRES, cpz.TimeUnit.day)
        .toISOString();

      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        secretCode: null,
        secretCodeExpireAt: null,
        status: cpz.UserStatus.enabled,
        refreshToken,
        refreshTokenExpireAt
      });
      await ctx.call(
        `${cpz.Service.MAIL}.subscribeToList`,
        {
          list: "cpz-beta@mg.cryptuoso.com",
          email: user.email
        },
        { parentCtx: ctx }
      );
      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: user.email,
        subject: "🚀 Welcome to Cryptuoso Platform - User Account Activated.",
        variables: {
          body: `<p>Congratulations!</p>
            <p>Your user account is successfully activated!</p>
            <p>Now you can login to <b><a href="https://cryptuoso.com/auth/login">your account</a></b> using your email and password.</p>
            <p>Please check out our <b><a href="https://support.cryptuoso.com">Documentation Site</a></b> to get started!</p>`
        },
        tags: ["auth"]
      });
      return {
        accessToken: this.generateAccessToken(user),
        refreshToken,
        refreshTokenExpireAt
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async passwordReset(ctx: Context<{ email: string }>) {
    try {
      const { email } = ctx.params;

      const [user]: cpz.User[] = await ctx.call(
        `${cpz.Service.DB_USERS}.find`,
        {
          query: { email }
        }
      );

      if (!user) throw new Error("User account not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");

      let secretCode;
      let secretCodeExpireAt;
      if (user.status === cpz.UserStatus.new) {
        secretCode = user.secretCode;
        secretCodeExpireAt = user.secretCodeExpireAt;
      } else {
        secretCode = this.generateCode();
        secretCodeExpireAt = dayjs
          .utc()
          .add(1, cpz.TimeUnit.hour)
          .toISOString();
        await ctx.call(`${cpz.Service.DB_USERS}.update`, {
          id: user.id,
          secretCode,
          secretCodeExpireAt
        });
      }

      const urlData = this.encodeData({
        userId: user.id,
        secretCode
      });
      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: user.email,
        subject: "🔐 Cryptuoso - Password Reset Request.",
        variables: {
          body: `
            <p>We received a request to reset your password. Please create a new password by clicking <a href="https://cryptuoso.com/auth/confirm-password-reset/${urlData}">this link</a></p>
            <p>or enter this code <b>${secretCode}</b> manually on reset password confirmation page.</p>
            <p>This request will expire in 1 hour.</p>
            <p>If you did not request this change, no changes have been made to your user account.</p>`
        },
        tags: ["auth"]
      });
      return user.id;
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async confirmPasswordReset(
    ctx: Context<{ userId: string; secretCode: string; password: string }>
  ) {
    try {
      const { userId, secretCode, password } = ctx.params;

      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId
      });

      if (!user) throw new Error("User account not found.");
      if (user.status === cpz.UserStatus.blocked)
        throw new Error("User account is blocked.");
      if (!user.secretCode) throw new Error("Confirmation code is not set.");
      if (user.secretCode !== secretCode)
        throw new Error("Wrong confirmation code.");

      let newSecretCode = null;
      let newSecretCodeExpireAt = null;
      if (user.status === cpz.UserStatus.new) {
        newSecretCode = user.secretCode;
        newSecretCodeExpireAt = user.secretCodeExpireAt;
      }

      await ctx.call(`${cpz.Service.DB_USERS}.update`, {
        id: userId,
        passwordHash: await bcrypt.hash(password, 10),
        secretCode: newSecretCode,
        secretCodeExpireAt: newSecretCodeExpireAt
      });

      await ctx.call(`${cpz.Service.MAIL}.send`, {
        to: user.email,
        subject: "🔐 Cryptuoso - Reset Password Confirmation.",
        variables: {
          body: `
            <p>Your password successfully changed!</p>
            <p>If you did not request this change, please contact support <a href="mailto:support@cryptuoso.com">support@cryptuoso.com</a></p>`
        },
        tags: ["auth"]
      });

      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: user.refreshToken,
        refreshTokenExpireAt: user.refreshTokenExpireAt
      };
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }

  async registerTg(
    ctx: Context<{
      telegramId: number;
      telegramUsername?: string;
      name?: string;
    }>
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
    try {
      this.authAction(ctx);
      const { id, name, email, telegramId, settings } = ctx.meta.user;
      return {
        success: true,
        result: {
          id,
          name,
          email,
          telegramId,
          settings
        }
      };
    } catch (e) {
      this.logger.warn(e);
      return { success: false, error: e.message };
    }
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
          "x-hasura-access": `${access}`
        }
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: `${process.env.JWT_TOKEN_EXPIRES}m`
      }
    );
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  encodeData(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString("base64");
  }
}

export = AuthService;
