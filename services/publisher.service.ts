import { Service, ServiceBroker, Context } from "moleculer";
import path from "path";
import TelegrafI18n from "telegraf-i18n";
import { cpz } from "../@types";
import Auth from "../mixins/auth";
import dayjs from "../lib/dayjs";

class PublisherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: cpz.Service.PUBLISHER,
      dependencies: [cpz.Service.TELEGRAM_BOT],
      mixins: [Auth],
      created: this.createdService,
      actions: {
        broadcastMessage: {
          params: {
            userId: { type: "string", optional: true },
            message: "string"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.broadcastMessage
        }
      },
      events: {
        [cpz.Event.SIGNAL_ALERT]: this.handleSignal,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignal
      }
    });
  }

  created() {
    this.i18n = new TelegrafI18n({
      defaultLanguage: "en",
      useSession: true,
      defaultLanguageOnMissing: true,
      directory: path.resolve(process.cwd(), "state/telegram/locales")
    });
  }

  async handleSignal(ctx: Context) {
    try {
      const signal = <cpz.SignalEvent>ctx.params;

      const { robotId, type, action } = signal;
      const { name } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id: robotId,
        fields: ["id", "name"]
      });

      const subscriptions: {
        telegramId: number;
        userId: string;
      }[] = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getTelegramSubscriptions`,
        {
          robotId
        }
      );

      if (
        subscriptions &&
        Array.isArray(subscriptions) &&
        subscriptions.length > 0
      ) {
        //TODO: Set lang from DB
        const LANG = "en";
        let message = "";
        const robotInfo = this.i18n.t(LANG, `signal.${type}`, { name });
        const actionText = this.i18n.t(LANG, `tradeAction.${signal.action}`);
        const orderTypeText = this.i18n.t(
          LANG,
          `orderType.${signal.orderType}`
        );

        if (type === cpz.SignalType.alert) {
          const signalText = this.i18n.t(LANG, "robot.signal", {
            code: signal.positionCode,
            timestamp: dayjs
              .utc(signal.timestamp)
              .format("YYYY-MM-DD HH:mm UTC"),
            action: actionText,
            orderType: orderTypeText,
            price: +signal.price
          });

          message = `${robotInfo}${signalText}`;
        } else {
          let tradeText = "";

          if (
            action === cpz.TradeAction.closeLong ||
            action === cpz.TradeAction.closeShort
          ) {
            const position = await this.broker.call(
              `${cpz.Service.DB_ROBOT_POSITIONS}.get`,
              {
                id: signal.positionId
              }
            );
            tradeText = this.i18n.t(LANG, "robot.positionClosed", {
              code: signal.positionCode,
              entryAction: this.i18n.t(
                LANG,
                `tradeAction.${position.entryAction}`
              ),
              entryOrderType: this.i18n.t(
                LANG,
                `orderType.${position.entryOrderType}`
              ),
              entryPrice: position.entryPrice,
              entryDate: dayjs
                .utc(position.entryDate)
                .format("YYYY-MM-DD HH:mm UTC"),
              exitAction: actionText,
              exitOrderType: orderTypeText,
              exitPrice: +signal.price,
              exitDate: dayjs
                .utc(signal.timestamp)
                .format("YYYY-MM-DD HH:mm UTC"),
              barsHeld: position.barsHeld,
              profit: position.profit
            });
          } else {
            tradeText = this.i18n.t(LANG, "robot.positionOpen", {
              code: signal.positionCode,
              entryAction: actionText,
              entryOrderType: orderTypeText,
              entryPrice: +signal.price,
              entryDate: dayjs
                .utc(signal.timestamp)
                .format("YYYY-MM-DD HH:mm UTC")
            });
          }
          message = `${robotInfo}${tradeText}`;
        }

        for (const { telegramId } of subscriptions) {
          try {
            await this.broker.call<cpz.TelegramMessage>(
              `${cpz.Service.TELEGRAM_BOT}.sendMessage`,
              {
                telegramId,
                message
              }
            );
          } catch (err) {
            this.logger.error(err);
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async broadcastMessage(ctx: Context<{ userId: string; message: string }>) {
    try {
      const users = [];
      if (ctx.params.userId) {
        const { telegramId } = await this.broker.call(
          `${cpz.Service.DB_USERS}.get`,
          {
            id: ctx.params.userId
          }
        );
        if (telegramId) users.push(telegramId);
      } else {
        const userslist = await this.broker.call(
          `${cpz.Service.DB_USERS}.find`,
          {
            fields: ["id", "telegramId"],
            query: {
              status: { $gt: 0 },
              telegramId: { $ne: null }
            }
          }
        );
        userslist.forEach(({ telegramId }: cpz.User) => {
          users.push(telegramId);
        });
      }

      for (const id of users) {
        try {
          await this.broker.call<cpz.TelegramMessage>(
            `${cpz.Service.TELEGRAM_BOT}.sendMessage`,
            {
              telegramId: id,
              message: ctx.params.message
            }
          );
        } catch (err) {
          this.logger.error(err);
        }
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = PublisherService;
