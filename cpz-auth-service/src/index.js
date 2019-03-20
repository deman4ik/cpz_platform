import jwt from "jsonwebtoken";
import { addNewUser, isUserExist } from "./db";
import config from "./config";

// TODO check HTTPS connection
// TODO check request endpoint
// TODO is User blocked

class AuthService {
  async registration(context, req) {
    let token;
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

    if (userExist) {
      context.res = {
        status: 400,
        body: "Email already registered",
        headers: {
          "Content-Type": "application/json"
        }
      };
      context.done();
    } else {
      const userId = addNewUser(email, password);
      token = await jwt.sign({
        userId,
        issuer: "cpz-auth-server"
      });
    }
  }

  logout() {}

  checkValidationCode() {
  }

  validateToken() {}
}

const service = new AuthService();

export default service;
