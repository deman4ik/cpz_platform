import { AUTH_SERVICE } from "cpz/config/services";

const SERVICE_NAME = AUTH_SERVICE;
const INTERNAL = {
  ACCESS_EXPIRES: 600, // seconds
  REFRESH_EXPIRES: 2.592e6, // 30 days
  AUTH_ISSUER: "cpz-auth",
  BAD_VALIDATE_CODE_COUNT: 10,
  BAD_LOGIN_COUNT: 10
};

export { SERVICE_NAME, INTERNAL };
