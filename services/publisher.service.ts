import { Service, ServiceBroker, Context } from "moleculer";
import path from "path";
import TelegrafI18n from "telegraf-i18n";
import { cpz } from "../@types";
import Auth from "../mixins/auth";
import dayjs from "../lib/dayjs";
import { round } from "../utils/helpers";

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
        volume: number;
        subscribedAt: string;
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
        let entities: { telegramId: number; message: string }[] = [];
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
          entities = subscriptions
            .filter(
              sub =>
                dayjs.utc(signal.candleTimestamp).valueOf() >=
                dayjs.utc(sub.subscribedAt).valueOf()
            )
            .map(sub => ({
              telegramId: sub.telegramId,
              message
            }));
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
            entities = subscriptions
              .filter(
                sub =>
                  dayjs.utc(position.entryDate).valueOf() >=
                  dayjs.utc(sub.subscribedAt).valueOf()
              )
              .map(sub => {
                let profit: number = 0;
                if (position.direction === cpz.PositionDirection.long) {
                  profit = +round(
                    (position.exitPrice - position.entryPrice) * sub.volume,
                    6
                  );
                } else {
                  profit = +round(
                    (position.entryPrice - position.exitPrice) * sub.volume,
                    6
                  );
                }
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
                  profit: profit
                });
                return {
                  telegramId: sub.telegramId,
                  message: `${robotInfo}${tradeText}`
                };
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
            message = `${robotInfo}${tradeText}`;
            entities = subscriptions.map(sub => ({
              telegramId: sub.telegramId,
              message
            }));
          }
        }

        if (entities.length > 0)
          await this.broker.call<cpz.TelegramMessage>(
            `${cpz.Service.TELEGRAM_BOT}.sendMessage`,
            {
              entities
            }
          );
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

      const entities = users.map(id => ({
        telegramId: id,
        message: ctx.params.message
      }));

      await this.broker.call<cpz.TelegramMessage>(
        `${cpz.Service.TELEGRAM_BOT}.sendMessage`,
        {
          entities
        }
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}

export = PublisherService;
