import { v4 as uuid } from "uuid";
import authService from "../src/index";
import { sendCode } from "../src/mailer";

jest.mock("cpz/log");
jest.mock("../src/mailer");
jest.mock("uuid");

describe("Test Auth Service", () => {
  sendCode.mockImplementation(() => true);
  uuid.mockImplementation(() => "cb454d29-6f71-43e5-b265-964d8cdb4c40");
  const context = {
    done: jest.fn()
  }; // Azure Functions context

  // Clear all mocks before each test
  beforeEach(() => jest.clearAllMocks());

  let validAccessToken;
  let validRefreshToken;

  describe("Test registration", () => {
    test("Should status 400 without email or password", async () => {
      const auth = authService;
      let req = {
        body: {
          password: "Lkkk3fls$"
        }
      };
      await auth.registration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad registration data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
      req = {
        body: {
          email: "test@test.ru"
        }
      };
      await auth.registration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad registration data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });
    test("Should status 401 with bad email", async () => {
      const req = {
        body: {
          email: "test@test.r",
          password: "Lkkk3fls$"
        }
      };
      const auth = authService;
      await auth.registration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Incorrect email address"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });
    test("Should status 401 with bad password", async () => {
      const req = {
        body: {
          email: "test@test.ru",
          password: "cf3mxkw"
        }
      };
      const auth = authService;
      await auth.registration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Weak password"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });
    test("Should status 400 when user already registered", async () => {
      const req = {
        body: {
          email: "test@test.ru",
          password: "cf3$dsDmxkw"
        }
      };
      const auth = authService;
      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: 1 });

      await auth.registration(context, req);

      expect(auth.db.findUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(context.res).toStrictEqual({
        body: '{"message":"Email already registered"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Should status 200 and send new code when user pending ", async () => {
      const req = {
        body: {
          email: "test@test.ru",
          password: "cf3$dsDmxkw"
        }
      };
      const auth = authService;
      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: 2 });
      auth.db.setCode = jest.fn().mockResolvedValue(true);

      await auth.registration(context, req);

      expect(auth.db.findUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(auth.db.setCode).toHaveBeenCalledTimes(1);
      expect(sendCode).toHaveBeenCalledTimes(1);
      expect(context.res).toStrictEqual({
        body: '{"message":"Check email"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      });
    });

    test("Should correct register user ", async () => {
      const req = {
        body: {
          email: "test@test.ru",
          password: "cf3$dsDmxkw"
        }
      };
      const auth = authService;
      auth.db.findUserByEmail = jest.fn().mockResolvedValue(undefined);
      auth.db.setCode = jest.fn().mockResolvedValue(true);
      auth.db.createUser = jest.fn((id, email) => ({ id, email }));

      await auth.registration(context, req);

      expect(auth.db.findUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(sendCode).toHaveBeenCalledTimes(1);
      expect(context.res).toStrictEqual({
        body:
          '{"id":"cb454d29-6f71-43e5-b265-964d8cdb4c40","message":"User created"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      });
    });

    test("Should return status 500 when throw error in method ", async () => {
      const req = {
        body: {
          email: "test@test.ru",
          password: "cf3$dsDmxkw"
        }
      };
      const auth = authService;
      auth.db.findUserByEmail = jest.fn().mockResolvedValue(undefined);
      auth.db.createUser = jest.fn(() => {
        throw new Error("Test error");
      });

      await auth.registration(context, req);

      expect(auth.db.findUserByEmail).toHaveBeenCalledWith(req.body.email);
      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });

  describe("Test finalize registration", () => {
    test("Should status 400 without id or code", async () => {
      const auth = authService;
      let req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40"
        }
      };
      await auth.finalizeRegistration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad registration data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
      req = {
        body: {
          code: "12345"
        }
      };
      await auth.finalizeRegistration(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad registration data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Can't find user by code", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest.fn().mockResolvedValue(undefined);
      auth.db.updateRegCodeCount = jest.fn();

      await auth.finalizeRegistration(context, req);
      expect(auth.db.updateRegCodeCount).toHaveBeenCalledWith(req.body.id, 1);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad registration code"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("User could be blocked", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 11 });
      auth.db.blockUser = jest.fn();

      await auth.finalizeRegistration(context, req);
      expect(auth.db.blockUser).toHaveBeenCalledWith(req.body.id);
      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("User could be registered", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 0 });
      auth.db.finalizeRegistration = jest.fn();

      await auth.finalizeRegistration(context, req);
      expect(auth.db.finalizeRegistration).toHaveBeenCalledTimes(1);
      expect(context.res.body).toEqual(expect.stringContaining("expiresIn"));
      expect(context.res).toHaveProperty("status", 200);
      expect(context.res.body).toEqual(expect.stringContaining("accessToken"));
      expect(context.res.body).toEqual(expect.stringContaining("refreshToken"));

      const data = JSON.parse(context.res.body);
      validAccessToken = data.accessToken;
      validRefreshToken = data.refreshToken;
    });

    test("Should return status 500 when throw error in method", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          code: "12345"
        }
      };
      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 0 });
      auth.db.finalizeRegistration = jest.fn(() => {
        throw new Error("test error");
      });

      await auth.finalizeRegistration(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });

  describe("Test token validation ", () => {
    test("Should status 400 without id or accessToken", async () => {
      const auth = authService;
      let req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40"
        }
      };
      await auth.validateToken(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
      req = {
        body: {
          accessToken: "someToken"
        }
      };
      await auth.validateToken(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });
    test("Token should valid", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          accessToken: validAccessToken
        }
      };

      await auth.validateToken(context, req);

      expect(context.res).toEqual({
        status: 200
      });
    });

    test("Token should invalid", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "cb454d29-6f71-43e5-b265-964d8cdb4c40",
          accessToken: `${validAccessToken}123`
        }
      };
      auth.db.deleteRefreshToken = jest.fn();
      await auth.validateToken(context, req);

      expect(auth.db.deleteRefreshToken).toHaveBeenCalledWith(req.body.id);
      expect(context.res).toEqual({
        body: '{"message":"Unverified token"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });
  });

  describe("Test refresh tokens", () => {
    beforeEach(() => jest.clearAllMocks());
    test("Should status 400 without token", async () => {
      const auth = authService;
      const req = {
        body: {}
      };
      await auth.refreshTokens(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad request data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Token shouldn't refresh token (unverified)", async () => {
      const auth = authService;
      const req = {
        body: {
          token: `${validRefreshToken}123`
        }
      };

      await auth.refreshTokens(context, req);

      expect(context.res).toEqual({
        body: '{"message":"Unverified token"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("Token shouldn't refresh token (different tokens)", async () => {
      const auth = authService;
      const req = {
        body: {
          token: validRefreshToken
        }
      };

      auth.db.findUserById = jest.fn().mockResolvedValue({
        id: "",
        refresh_tokens: `123${validRefreshToken}123`
      });
      auth.db.deleteRefreshToken = jest.fn().mockResolvedValue(true);

      await auth.refreshTokens(context, req);
      expect(auth.db.deleteRefreshToken).toHaveBeenCalledTimes(1);
      expect(context.res).toEqual({
        body: '{"message":"Bad token"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("Token should refresh tokens", async () => {
      const auth = authService;
      const req = {
        body: {
          token: validRefreshToken
        }
      };

      auth.db.findUserById = jest.fn().mockResolvedValue({
        id: "",
        refresh_tokens: validRefreshToken
      });
      auth.db.updateRefreshToken = jest.fn().mockResolvedValue(true);

      await auth.refreshTokens(context, req);
      expect(auth.db.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(context.res.body).toEqual(expect.stringContaining("expiresIn"));
      expect(context.res).toHaveProperty("status", 200);
      expect(context.res.body).toEqual(expect.stringContaining("accessToken"));
      expect(context.res.body).toEqual(expect.stringContaining("refreshToken"));
    });

    test("Should return status 500 when throw error in method", async () => {
      const auth = authService;
      const req = {
        body: {
          token: validRefreshToken
        }
      };
      auth.db.findUserById = jest.fn().mockResolvedValue({
        id: "",
        refresh_tokens: validRefreshToken
      });
      auth.db.updateRefreshToken = jest.fn(() => {
        throw new Error("Test error");
      });

      await auth.refreshTokens(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });

  describe("Test login", () => {
    test("Should status 400 without id or accessToken", async () => {
      const auth = authService;
      let req = {
        body: {
          email: "test@test.com"
        }
      };
      await auth.login(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad login data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
      req = {
        body: {
          password: "somePasword"
        }
      };
      await auth.login(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad login data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });
    test("User deleted or blocked", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "somePassword"
        }
      };
      const auth = authService;
      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: -1 });

      await auth.login(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked or disabled"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: 0 });

      await auth.login(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked or disabled"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("User pending registration", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "somePassword"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: 0 });

      await auth.login(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked or disabled"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("User blocked", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "somePassword"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest
        .fn()
        .mockResolvedValue({ status: 1, bad_login_count: 11 });
      auth.db.blockUser = jest.fn().mockResolvedValue(true);

      await auth.login(context, req);

      expect(auth.db.blockUser).toHaveBeenCalledTimes(1);
      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Bad password", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "flKlslkl6$"
        }
      };
      const badHash =
        "$3b$10$2KsUFYDqOJJDmTiGdqYn8.lZYEKYDcqG/jFoT1COzllMfqoY3rj5O";
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({
        id: "id",
        status: 1,
        bad_login_count: 0,
        pwdhash: badHash
      });
      auth.db.updateLoginCount = jest.fn().mockResolvedValue(true);

      await auth.login(context, req);

      expect(auth.db.updateLoginCount).toHaveBeenCalledWith("id", 1);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad password"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("Success login", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "flKlslkl6$"
        }
      };
      const passHash =
        "$2b$10$2KsUFYDqOJJDmTiGdqYn8.lZYEKYDcqG/jFoT1COzllMfqoY3rj5O";
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({
        id: "id",
        status: 1,
        bad_login_count: 0,
        pwdhash: passHash
      });
      auth.db.updateRefreshToken = jest.fn().mockResolvedValue(true);

      await auth.login(context, req);

      expect(auth.db.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(context.res.body).toEqual(expect.stringContaining("expiresIn"));
      expect(context.res).toHaveProperty("status", 200);
      expect(context.res.body).toEqual(expect.stringContaining("accessToken"));
      expect(context.res.body).toEqual(expect.stringContaining("refreshToken"));
    });

    test("Should return status 500 when throw error in method", async () => {
      const req = {
        body: {
          email: "test@test.com",
          password: "flKlslkl6$"
        }
      };
      const passHash =
        "$2b$10$2KsUFYDqOJJDmTiGdqYn8.lZYEKYDcqG/jFoT1COzllMfqoY3rj5O";
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({
        id: "id",
        status: 1,
        bad_login_count: 0,
        pwdhash: passHash
      });
      auth.db.updateRefreshToken = jest.fn(() => {
        throw new Error("Test error");
      });

      await auth.login(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });

  describe("Test reset password", () => {
    test("Should status 400 without email", async () => {
      const auth = authService;
      const req = {
        body: {}
      };
      await auth.resetPassword(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("User email not found", async () => {
      const req = {
        body: {
          email: "test@test.com"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue(undefined);

      await auth.resetPassword(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"Email not found"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("User deleted or blocked", async () => {
      const req = {
        body: {
          email: "test@test.com"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: -1 });

      await auth.resetPassword(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"User deleted or blocked"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });

      auth.db.findUserByEmail = jest.fn().mockResolvedValue({ status: 0 });

      await auth.resetPassword(context, req);

      expect(context.res).toStrictEqual({
        body: '{"message":"User deleted or blocked"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Reset code send", async () => {
      const req = {
        body: {
          email: "test@test.com"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest
        .fn()
        .mockResolvedValue({ id: "id", status: 1 });
      auth.db.setCode = jest.fn().mockResolvedValue(true);

      await auth.resetPassword(context, req);

      expect(auth.db.setCode).toHaveBeenCalledTimes(1);
      expect(sendCode).toHaveBeenCalledTimes(1);
      expect(context.res).toStrictEqual({
        body: '{"id":"id","message":"Check code on email"}',
        status: 200
      });
    });

    test("Should return status 500 when throw error in method", async () => {
      const req = {
        body: {
          email: "test@test.com"
        }
      };
      const auth = authService;

      auth.db.findUserByEmail = jest
        .fn()
        .mockResolvedValue({ id: "id", status: 1 });
      auth.db.setCode = jest.fn(() => {
        throw new Error("Test error");
      });

      await auth.resetPassword(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });

  describe("Test finalize reset password", () => {
    test("Should status 400 without id or code or password", async () => {
      const auth = authService;
      let req = {
        body: {
          password: "pass",
          code: "12345"
        }
      };
      await auth.finalizeResetPassword(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });

      req = {
        body: {
          id: "id",
          code: "12345"
        }
      };
      await auth.finalizeResetPassword(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });

      req = {
        body: {
          id: "id",
          password: "pass"
        }
      };
      await auth.finalizeResetPassword(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad data"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });
    test("Should be error weak password", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "id",
          password: "pass",
          code: "12345"
        }
      };
      await auth.finalizeResetPassword(context, req);
      expect(context.res).toStrictEqual({
        body: '{"message":"Weak password"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 401
      });
    });

    test("Can't find user by code", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "id",
          password: "QEsrsfss4$",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest.fn().mockResolvedValue(undefined);
      auth.db.updateRegCodeCount = jest.fn();

      await auth.finalizeResetPassword(context, req);
      expect(auth.db.updateRegCodeCount).toHaveBeenCalledWith(req.body.id, 1);
      expect(context.res).toStrictEqual({
        body: '{"message":"Bad reset password code"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("User could be blocked", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "id",
          password: "QEsrsfss4$",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 11 });
      auth.db.blockUser = jest.fn();

      await auth.finalizeResetPassword(context, req);
      expect(auth.db.blockUser).toHaveBeenCalledWith(req.body.id);
      expect(context.res).toStrictEqual({
        body: '{"message":"User blocked"}',
        headers: {
          "Content-Type": "application/json"
        },
        status: 400
      });
    });

    test("Success set password", async () => {
      const auth = authService;
      const req = {
        body: {
          id: "id",
          password: "QEsrsfss4$",
          code: "12345"
        }
      };

      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 0 });
      auth.db.setNewPass = jest.fn().mockResolvedValue(true);
      auth.db.updateRefreshToken = jest.fn().mockResolvedValue(true);

      await auth.finalizeResetPassword(context, req);
      expect(auth.db.setNewPass).toHaveBeenCalledTimes(1);
      expect(auth.db.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(context.res.body).toEqual(expect.stringContaining("expiresIn"));
      expect(context.res).toHaveProperty("status", 200);
      expect(context.res.body).toEqual(expect.stringContaining("accessToken"));
      expect(context.res.body).toEqual(expect.stringContaining("refreshToken"));
    });

    test("Should return status 500 when throw error in method", async () => {
      const req = {
        body: {
          id: "id",
          password: "QEsrsfss4$",
          code: "12345"
        }
      };
      const auth = authService;

      auth.db.findUserByCode = jest
        .fn()
        .mockResolvedValue({ bad_regcode_count: 0 });
      auth.db.setNewPass = jest.fn().mockResolvedValue(true);
      auth.db.updateRefreshToken = jest.fn(() => {
        throw new Error("Test error");
      });

      await auth.finalizeResetPassword(context, req);

      expect(context.res).toStrictEqual({
        headers: {
          "Content-Type": "application/json"
        },
        status: 500
      });
    });
  });
});
