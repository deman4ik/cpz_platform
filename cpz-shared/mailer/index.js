import Mailgun from "mailgun-js";
import Log from "../log";
import ServiceError from "../error";

class Mailer {
  init({ apiKey, domain }) {
    try {
      let config = {};
      if (apiKey && domain) {
        config = { apiKey, domain, host: "api.eu.mailgun.net" };
      } else {
        config = { apiKey: "none", domain: "none", testMode: true };
        Log.warn("Mailer runs in TEST mode.");
      }

      this.client = new Mailgun(config);
      this.betaList = this.client.lists(process.env.MAILGUN_BETA_LIST);
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

  async addToList(data) {
    try {
      return await this.betaList.members().create(data);
    } catch (e) {
      const error = new ServiceError(
        { name: ServiceError.types.MAILER_ERROR, cause: e },
        "Failed to add email to subscription list"
      );
      throw error;
    }
  }
}
const mailer = new Mailer();
export default mailer;
