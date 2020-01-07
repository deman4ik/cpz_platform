import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../@types";
import Mailgun from "mailgun-js";

class MailService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: cpz.Service.MAIL,
      created: this.createdService,
      actions: {
        send: {
          params: {
            from: {
              type: "string",
              default: "Cryptuoso <noreply@cryptuoso.com>"
            },
            to: [{ type: "email" }, { type: "array", items: "email" }],
            subject: "string",
            text: { type: "string", optional: true },
            html: { type: "string", optional: true },
            template: { type: "string", default: "simple" },
            variables: { type: "object", optional: true },
            tags: { type: "array", items: "string" }
          },
          handler: this.send
        },
        subscribeToList: {
          params: {
            list: "string",
            email: "email",
            name: { type: "string", optional: true }
          },
          handler: this.subscribeToList
        },
        subscribeToBetaMailList: {
          params: {
            email: "email",
            name: { type: "string", optional: true }
          },
          graphql: {
            mutation:
              "subscribeToBetaMailList(email: String!, name: String):Response!"
          },
          handler: this.subscribeToBetaMailList
        }
      }
    });
  }

  createdService() {
    let config;
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      config = {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
        host: "api.eu.mailgun.net"
      };
    } else {
      config = { apiKey: "none", domain: "none", testMode: true };
      this.logger.warn("Mail Service runs in TEST mode.");
    }
    this.mailgun = new Mailgun(config);
  }

  async send(
    ctx: Context<{
      from?: string;
      to: string | string[];
      subject?: string;
      text?: string;
      html?: string;
      template?: string;
      variables?: { [key: string]: string };
      tags: string[];
    }>
  ) {
    try {
      const {
        from,
        to,
        subject,
        text,
        html,
        template,
        variables,
        tags
      } = ctx.params;
      return this.mailgun.messages().send({
        from,
        to,
        subject,
        text,
        html,
        template,
        "h:X-Mailgun-Variables":
          variables && Object.keys(variables) && JSON.stringify(variables),
        "o:tag": tags
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async subscribeToList(
    ctx: Context<{ list: string; email: string; name?: string }>
  ) {
    try {
      const { list, email, name } = ctx.params;
      const result = await this.mailgun
        .lists(list)
        .members()
        .create({
          subscribed: true,
          address: email,
          name
        });
      this.logger.info("result", result);
      return true;
    } catch (e) {
      if (e.message.includes("Address already exists")) return false;
      this.logger.error(e);
      throw e;
    }
  }

  async subscribeToBetaMailList(
    ctx: Context<{ email: string; name?: string }>
  ) {
    try {
      const { email, name } = ctx.params;
      const subcribed = await this.actions.subscribeToList(
        {
          list: "cpz-beta@mg.cryptuoso.com",
          email,
          name
        },
        { parentCtx: ctx }
      );
      this.logger.info("subcribed", subcribed);
      if (subcribed) {
        await this.actions.send(
          {
            to: email,
            subject: "🚀 Cryptuoso - Early access subscription confirmation.",
            variables: {
              body: `<p>Greetings!</p>
              <p>You are successfully subscribed to our <b>Cryptuoso Apps Beta</b> early access list!  </p>
              <p>We will notify you about the most important Cryptuoso Platform updates and <b>Cryptuoso Web and Mobile Apps Beta</b> launch date.</p>
              <p>Please complete <b><a href="https://forms.gle/fMThy2t9n6yZD9SZ7">the survey ✅</a></b>, to help us improve our service for you.</p></br>
              <p><b>You can subscribe to signals and start trading with Cryptuoso Cryptocurrency Trading <a href="https://t.me/cryptuoso_bot">Telegram Bot 🤖</a> right now! 🚀🚀🚀</b></p>`
            },
            tags: ["beta"]
          },
          { parentCtx: ctx }
        );
      }
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }
}

export = MailService;
