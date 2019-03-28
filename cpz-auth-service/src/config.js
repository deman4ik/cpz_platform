const config = {
  SERVICE_NAME: "AUTH_SERVICE",
  ACCESS_EXPIRES: 600, // seconds
  REFRESH_EXPIRES: 2.592e6, // 30 days]
  AUTH_ISSUER: "cpz-auth-server",
  BAD_VALIDATE_CODE_COUNT: 10,
  BAD_LOGIN_COUNT: 10
};

export default config;
