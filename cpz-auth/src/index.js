import { v4 as uuid } from "uuid";
import ServiceError from "cpz/error";
import jwt from "jsonwebtoken";
import DB from "cpz/db-client";
import bcrypt from "bcrypt";
import Log from "cpz/log";
import Mailer from "cpz/mailer";
import { checkEnvVars } from "cpz/utils/environment";
import authEnv from "cpz/config/environment/auth";
import { SERVICE_NAME, INTERNAL } from "./config";

const { BAD_VALIDATE_CODE_COUNT, BAD_LOGIN_COUNT, AUTH_ISSUER } = INTERNAL;

const emailReqex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passRegex = /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!@#$%^&*-])){8,}/;
const {
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
  JWT_SECRET,
  DB_API_ENDPOINT,
  DB_API_ACCESS_KEY,
  APPINSIGHTS_INSTRUMENTATIONKEY,
  MAILGUN_API,
  MAILGUN_DOMAIN
} = process.env;

// TODO: Email case sensivity
class AuthService {
  constructor() {
    this.init();
  }

  init() {
    // Check environment variables
    checkEnvVars(authEnv.variables);
    this.accessExpires = parseInt(ACCESS_EXPIRES, 10);
    this.refreshExpires = REFRESH_EXPIRES;
    Log.config({
      key: APPINSIGHTS_INSTRUMENTATIONKEY,
      serviceName: SERVICE_NAME
    });
    this.mailer = new Mailer({ apiKey: MAILGUN_API, domain: MAILGUN_DOMAIN });
    DB.init({ endpoint: DB_API_ENDPOINT, key: DB_API_ACCESS_KEY });
  }

  // TODO: Add API KEY
  async registration(context, req) {
    try {
      const { email, password } = req.body || false;

      if (!email || !password) {
        context.res = {
          status: 400,
          body: { message: "Bad registration data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      // Password check expected complexity
      if (!passRegex.test(password)) {
        context.res = {
          status: 401,
          body: { message: "Weak password" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      // Email check expected format
      if (!emailReqex.test(email)) {
        context.res = {
          status: 401,
          body: JSON.stringify({ message: "Incorrect email address" }),
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByEmail(email);

      if (user && user.status === 1) {
        context.res = {
          status: 400,
          body: JSON.stringify({ message: "Email already registered" }),
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      // Generate 5 digit registration code
      const code = Math.floor(10000 + Math.random() * 90000);

      if (user && user.status === 2) {
        await this.db.setCode(user.id, code);
        // Send email with code
        await this.mailer.send({
          to: email,
          subject: "🚀 Cryptuoso - Please verify your email!",
          text: `Greetings! Your confirmation code is ${code}.\n\nCryptuoso`
        });
        context.res = {
          status: 200,
          body: { message: "Check email" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      // Generate password Hash
      const passwordHash = bcrypt.hashSync(password, 10);

      const newUser = await this.db.createUser(
        uuid(),
        email,
        passwordHash,
        code
      );

      // Send email with code
      await this.mailer.send({
        to: email,
        subject:
          "🚀 Your Cryptuoso account is created! Please verify your email!",
        text: `Greetings! Your confirmation code is ${code}.\n\nCryptuoso`
      });

      context.res = {
        status: 200,
        body: { id: newUser.id, message: "User created" },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to register"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async finalizeRegistration(context, req) {
    try {
      const { id, code } = req.body || false;

      if (!id || !code) {
        context.res = {
          status: 400,
          body: { message: "Bad registration data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByCode(id, code);

      if (!user) {
        await this.db.updateRegCodeCount(id, 1);
        context.res = {
          status: 400,
          body: { message: "Bad registration code" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.bad_regcode_count > BAD_VALIDATE_CODE_COUNT) {
        await this.db.blockUser(id);
        context.res = {
          status: 400,
          body: { message: "User blocked" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const expiresIn = new Date().getTime() + this.accessExpires;
      const accessToken = jwt.sign(
        {
          userId: user.id,
          "https://hasura.io/jwt/claims": {
            "x-hasura-default-role": user.role,
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-user-id": user.id
          }
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.finalizeRegistration(user.id, refreshToken);

      context.res = {
        status: 200,
        body: {
          expiresIn,
          accessToken,
          refreshToken
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to finalize registration"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async validateToken(context, req) {
    try {
      const { id, accessToken } = req.body;

      if (!id || !accessToken) {
        context.res = {
          status: 400,
          body: { message: "Bad data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      try {
        jwt.verify(accessToken, JWT_SECRET, { issuer: AUTH_ISSUER });
      } catch (e) {
        await this.db.deleteRefreshToken(id);
        context.res = {
          status: 401,
          body: { message: "Unverified token" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      context.res = {
        status: 200
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to validate token"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async refreshTokens(context, req) {
    try {
      const { token } = req.body || false;

      if (!token) {
        context.res = {
          status: 400,
          body: { message: "Bad request data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      let verifiedToken;

      try {
        verifiedToken = jwt.verify(token, JWT_SECRET, { issuer: AUTH_ISSUER });
      } catch (e) {
        context.res = {
          status: 401,
          body: { message: "Unverified token" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserById(verifiedToken.userId);

      if (token !== user.refresh_tokens) {
        await this.db.deleteRefreshToken(user.id);
        context.res = {
          status: 401,
          body: { message: "Bad token" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      const expiresIn = new Date().getTime() + this.accessExpires;
      const accessToken = jwt.sign(
        {
          userId: user.id,
          "https://hasura.io/jwt/claims": {
            "x-hasura-default-role": user.role,
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-user-id": user.id
          }
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.updateRefreshToken(user.id, refreshToken);

      context.res = {
        status: 200,
        body: {
          expiresIn,
          accessToken,
          refreshToken
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to refresh token"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async login(context, req) {
    try {
      const { email, password } = req.body || false;
      if (!email || !password) {
        context.res = {
          status: 400,
          body: { message: "Bad login data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByEmail(email);
      if (!user) {
        context.res = {
          status: 401,
          body: { message: "User not found" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.status === -1 || user.status === 0) {
        context.res = {
          status: 401,
          body: { message: "User blocked or disabled" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.status === 2) {
        context.res = {
          status: 401,
          body: { message: "User pending registration" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.bad_login_count > BAD_LOGIN_COUNT) {
        await this.db.blockUser(user.id);
        context.res = {
          status: 400,
          body: { message: "User blocked" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const isEqual = bcrypt.compareSync(password, user.pwdhash);

      if (!isEqual) {
        await this.db.updateLoginCount(user.id, 1);
        context.res = {
          status: 401,
          body: { message: "Bad password" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const expiresIn = new Date().getTime() + this.accessExpires;
      const accessToken = jwt.sign(
        {
          userId: user.id,
          "https://hasura.io/jwt/claims": {
            "x-hasura-default-role": user.role,
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-user-id": user.id
          }
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      this.db.updateRefreshToken(user.id, JSON.stringify(refreshToken));

      context.res = {
        status: 200,
        body: {
          expiresIn,
          accessToken,
          refreshToken
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to login"
      );

      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async resetPassword(context, req) {
    try {
      const { email } = req.body || false;

      if (!email) {
        context.res = {
          status: 400,
          body: { message: "Bad data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByEmail(email);

      if (!user) {
        context.res = {
          status: 400,
          body: { message: "Email not found" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.status === -1 || user.status === 0) {
        context.res = {
          status: 400,
          body: { message: "User deleted or blocked" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      const code = Math.floor(10000 + Math.random() * 90000);
      await this.db.setCode(user.id, code);

      // Send email with code
      await this.mailer.send({
        to: email,
        subject: "🚀 Cryptuoso - Reset password!",
        text: `Greetings! We received a request to reset your Cryptuoso account password. Your confirmation code is ${code}.\n
        If you did not request a password reset, feel free to disregard this email — your password will not be changed.
        \n\nCryptuoso`
      });

      context.res = {
        status: 200,
        body: { id: user.id, message: "Check code on email" }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to reset password"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async finalizeResetPassword(context, req) {
    try {
      const { id, code, password } = req.body || false;

      if (!id || !code || !password) {
        context.res = {
          status: 400,
          body: { message: "Bad data" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }
      // Password check expected complexity
      if (!passRegex.test(password)) {
        context.res = {
          status: 401,
          body: { message: "Weak password" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByCode(id, code);

      if (!user) {
        await this.db.updateRegCodeCount(id, 1);
        context.res = {
          status: 400,
          body: { message: "Bad reset password code" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      if (user.bad_regcode_count > BAD_VALIDATE_CODE_COUNT) {
        await this.db.blockUser(id);
        context.res = {
          status: 400,
          body: { message: "User blocked" },
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      // Generate password Hash
      const hash = bcrypt.hashSync(password, 10);
      // Save new pass
      await this.db.setNewPass(id, hash);

      const expiresIn = new Date().getTime() + this.accessExpires;
      const accessToken = jwt.sign(
        {
          userId: user.id,
          "https://hasura.io/jwt/claims": {
            "x-hasura-default-role": user.role,
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-user-id": user.id
          }
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: AUTH_ISSUER,
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.updateRefreshToken(user.id, JSON.stringify(refreshToken));

      context.res = {
        status: 200,
        body: {
          expiresIn,
          accessToken,
          refreshToken
        },
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (e) {
      const error = new ServiceError(
        {
          name: ServiceError.types.AUTH_ERROR,
          cause: e
        },
        "Failed to finalize reset password"
      );
      Log.error(error);
      context.res = {
        status: 500,
        body: error.json,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }
}

const service = new AuthService();

export default service;
