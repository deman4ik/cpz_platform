import { AUTH_SERVICE } from "cpz/config/services";

const SERVICE_NAME = AUTH_SERVICE;
const INTERNAL = {
  AUTH_ISSUER: "cpz-auth",
  BAD_VALIDATE_CODE_COUNT: 10,
  BAD_LOGIN_COUNT: 10
};

export { SERVICE_NAME, INTERNAL };
