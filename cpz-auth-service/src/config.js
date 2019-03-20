const config = {
  passwordHashString: "qwerty",
  expires_in: 600000, // ACCESS TOKEN expiration time (10 min)
  providers: {
    telegram: {
      // http://www.passportjs.org/packages/passport-telegram/
      clientID: "TELEGRAM_CLIENT_ID",
      clientSecret: "TELEGRAM_CLIENT_SECRET",
      callbackURL: "AZURE FUNCTION CALLBACK ENDPOINT"
    },
    google: {
      // https://github.com/jaredhanson/passport-google-oauth2
      clientID: "GOOGLE_CLIENT_ID",
      clientSecret: "GOOGLE_CLIENT_SECRET",
      scope: {},
      callbackURL: "AZURE FUNCTION CALLBACK ENDPOINT"
    }
  }
};

export default config;
