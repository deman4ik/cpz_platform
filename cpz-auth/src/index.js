import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import Db from "cpz/db-client";
import bcrypt from "bcrypt";
import Log from "cpz/log";
import { checkEnvVars } from "cpz/utils/environment";
import authEnv from "cpz/config/environment/auth";
import { sendCode } from "./mailer";
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
  APPINSIGHTS_INSTRUMENTATIONKEY
} = process.env;

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
    this.db = new Db({ endpoint: DB_API_ENDPOINT, key: DB_API_ACCESS_KEY });
  }

  // TODO: Add API KEY
  async registration(context, req) {
    try {
      const { email, password } = req.body || false;

      if (!email || !password) {
        context.res = {
          status: 400,
          body: JSON.stringify({ message: "Bad registration data" }),
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
          body: JSON.stringify({ message: "Weak password" }),
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
        await sendCode(email, code);
        context.res = {
          status: 200,
          body: JSON.stringify({ message: "Check email" }),
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
      await sendCode(email, code);

      context.res = {
        status: 200,
        body: JSON.stringify({ id: newUser.id, message: "User created" }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
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
          body: JSON.stringify({ message: "Bad registration data" }),
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
          body: JSON.stringify({ message: "Bad registration code" }),
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
          body: JSON.stringify({ message: "User blocked" }),
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
          issuer: "cpz-auth-server",
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.finalizeRegistration(user.id, refreshToken);

      context.res = {
        status: 200,
        body: JSON.stringify({
          expiresIn,
          accessToken,
          refreshToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  async validateToken(context, req) {
    const { id, accessToken } = req.body;

    if (!id || !accessToken) {
      context.res = {
        status: 400,
        body: JSON.stringify({ message: "Bad data" }),
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
        body: JSON.stringify({ message: "Unverified token" }),
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
  }

  async refreshTokens(context, req) {
    try {
      const { token } = req.body || false;

      if (!token) {
        context.res = {
          status: 400,
          body: JSON.stringify({ message: "Bad request data" }),
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
          body: JSON.stringify({ message: "Unverified token" }),
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
          body: JSON.stringify({ message: "Bad token" }),
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
          issuer: "cpz-auth-server",
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.updateRefreshToken(user.id, refreshToken);

      context.res = {
        status: 200,
        body: JSON.stringify({
          expiresIn,
          accessToken,
          refreshToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
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
          body: JSON.stringify({ message: "Bad login data" }),
          headers: {
            "Content-Type": "application/json"
          }
        };
        context.done();
        return;
      }

      const user = await this.db.findUserByEmail(email);

      if (user.status === -1 || user.status === 0) {
        context.res = {
          status: 401,
          body: JSON.stringify({ message: "User blocked or disabled" }),
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
          body: JSON.stringify({ message: "User pending registration" }),
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
          body: JSON.stringify({ message: "User blocked" }),
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
          body: JSON.stringify({ message: "Bad password" }),
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
          issuer: "cpz-auth-server",
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      this.db.updateRefreshToken(user.id, JSON.stringify(refreshToken));

      context.res = {
        status: 200,
        body: JSON.stringify({
          expiresIn,
          accessToken,
          refreshToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
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
          body: JSON.stringify({ message: "Bad data" }),
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
          body: JSON.stringify({ message: "Email not found" }),
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
          body: JSON.stringify({ message: "User deleted or blocked" }),
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
      await sendCode(email, code);

      context.res = {
        status: 200,
        body: JSON.stringify({ id: user.id, message: "Check code on email" })
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
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
          body: JSON.stringify({ message: "Bad data" }),
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
          body: JSON.stringify({ message: "Weak password" }),
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
          body: JSON.stringify({ message: "Bad reset password code" }),
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
          body: JSON.stringify({ message: "User blocked" }),
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
          issuer: "cpz-auth-server",
          expiresIn: this.accessExpires
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: this.refreshExpires
        }
      );
      // Save Refresh Token in DB
      await this.db.updateRefreshToken(user.id, JSON.stringify(refreshToken));

      context.res = {
        status: 200,
        body: JSON.stringify({
          expiresIn,
          accessToken,
          refreshToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } catch (error) {
      Log.error(error);
      context.res = {
        status: 500,
        body: error,
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
