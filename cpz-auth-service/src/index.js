import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { addNewUser, findUserByEmail, isUserExist, updateRefreshToken } from "./db";
import config from "./config";

const { ACCESS_EXPIRES, JWT_SECRET, REFRESH_EXPIRES, AUTH_ISSUER } = config;

// TODO check HTTPS connection
// TODO check request endpoint
// TODO is User blocked

// TODO REFACTOR

class AuthService {
  async registration(context, req) {
    const { email, password } = req.body;
    if (!!email || !!password) {
      context.res = {
        status: 400,
        body: "Bad registration data",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    const userExist = isUserExist(email);

    function isSuitablePassword(psw) {
      let result = false;
      if (
        psw.length > 8 &&
        // Password contains one or more digit
        psw.search(/\d+/) !== -1 &&
        // Password contains one o more word character
        psw.search(/[a-z]+/) !== -1 &&
        // Password contains one o more capital word character
        psw.search(/[A-Z]+/) !== -1
      ) {
        result = true;
      }
      return result;
    }

    if (userExist) {
      context.res = {
        status: 400,
        body: "Email already registered",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } else if (isSuitablePassword(password)) {
      // Generate password Hash
      const passwordHash = bcrypt.hashSync(password, 10);
      // Generate 5 digit registration code
      const code = Math.floor(10000 + Math.random() * 90000);
      const user = addNewUser(email, passwordHash, code);

      // TODO Send code to email provider (email, code)

      context.res = {
        status: 200
      };
      context.done();
    }
  }

  checkRegistrationCode(context, req) {
    const code = req.body;

    const user = findUserByCode(code);

    if (user) {
      const expiresIn = new Date().getTime() + ACCESS_EXPIRES;
      const accessToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: ACCESS_EXPIRES
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: REFRESH_EXPIRES
        }
      );
      // Save Refresh Token in DB
      updateRefreshToken(user.id, JSON.stringify(refreshToken));

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
    } else {
      context.res = {
        status: 400,
        body: "Bad registration code",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  refreshTokens(context, req) {
    const token = req.body;
    let verifiedToken;

    try {
      verifiedToken = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      context.res = {
        status: 401,
        body: "Unverified token",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    const { exp, iss } = veririedToken;

    if (now > exp) {
      // Need refresh token
      context.res = {
        status: 401,
        body: "Token Expire",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
    if (iss !== AUTH_ISSUER) {
      // TODO DELETE REFRESH TOKEN FROM DB
      context.res = {
        status: 401,
        body: "Not expect Issuer",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    const { id } = verifiedToken;

    const user = findUserById(id);

    if (user.verifiedToken === refreshToken) {
      const expiresIn = new Date().getTime() + ACCESS_EXPIRES;
      const accessToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: ACCESS_EXPIRES
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: REFRESH_EXPIRES
        }
      );
      // Save Refresh Token in DB
      updateRefreshToken(user.id, JSON.stringify(refreshToken));

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
    } else {
      context.res = {
        status: 401,
        body: {},
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  login(context, req) {
    const { email, password } = req.body;
    if (!!email || !!password) {
      context.res = {
        status: 400,
        body: "Bad login data",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    const user = findUserByEmail(email);

    const isEqueal = bcrypt.compareSync(password, user.password);

    if (isEqueal) {
      const expiresIn = new Date().getTime() + ACCESS_EXPIRES;
      const accessToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: ACCESS_EXPIRES
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id
        },
        JWT_SECRET,
        {
          issuer: "cpz-auth-server",
          expiresIn: REFRESH_EXPIRES
        }
      );
      // Save Refresh Token in DB
      updateRefreshToken(user.id, JSON.stringify(refreshToken));

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
    } else {
      context.res = {
        status: 401,
        body: "Bad password",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
  }

  validateToken(context, req) {
    const now = new Date().getTime();
    const token = req.body;
    let veririedToken;
    try {
      veririedToken = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      context.res = {
        status: 401,
        body: "Unverified token",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    const { exp, iss } = veririedToken;

    if (now > exp) {
      // Need refresh token
      context.res = {
        status: 401,
        body: "Token Expire",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }
    if (iss !== AUTH_ISSUER) {
      // TODO DELETE REFRESH TOKEN FROM DB
      context.res = {
        status: 401,
        body: "Not expect Issuer",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    }

    context.res = {
      status: 200
    };
    context.done();
  }
}

const service = new AuthService();

export default service;
