import Mailgun from "mailgun-js";
import Log from "../log";
import ServiceError from "../error";

class Mailer {
  constructor({ apiKey, domain }) {
    try {
      let config = {};
      if (apiKey && domain) {
        config = { apiKey, domain, host: "api.eu.mailgun.net" };
      } else {
        config = { apiKey: "none", domain: "none", testMode: true };
        Log.warn("Mailer runs in TEST mode.");
      }

      this.client = new Mailgun(config);
    } catch (e) {
      const error = new ServiceError(
        { name: ServiceError.types.MAILER_ERROR, cause: e },
        "Failed to initialize Mailer"
      );
      Log.exception(error);
      throw error;
    }
  }

  // TODO: HTML Templates
  async send(data) {
    try {
      await this.client.messages().send({
        from: "Cryptuoso <noreply@cryptuoso.com>",
        ...data
      });
    } catch (e) {
      const error = new ServiceError(
        { name: ServiceError.types.MAILER_ERROR, cause: e },
        "Failed to send email"
      );
      throw error;
    }
  }
}

export default Mailer;
