import { Service, ServiceBroker, Context } from "moleculer";
import path from "path";
import TelegrafI18n from "telegraf-i18n";
import { cpz } from "../@types";
import dayjs from "../lib/dayjs";
import { round } from "../utils/helpers";
import cron from "node-cron";
import RedisLock from "../mixins/redislock";

class PublisherService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: cpz.Service.PUBLISHER,
      mixins: [RedisLock()],
      dependencies: [
        cpz.Service.TELEGRAM_BOT,
        cpz.Service.DB_USERS,
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_ROBOT_POSITIONS,
        cpz.Service.DB_USER_SIGNALS,
        cpz.Service.DB_NOTIFICATIONS
      ],
      created: this.createdService,
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  createdService() {
    this.i18n = new TelegrafI18n({
      defaultLanguage: "en",
      useSession: true,
      defaultLanguageOnMissing: true,
      directory: path.resolve(process.cwd(), "state/telegram/locales")
    });
  }

  async startedService() {
    this.cronJobs.start();
  }
  async stoppedService() {
    this.cronJobs.stop();
  }

  cronJobs: cron.ScheduledTask = cron.schedule(
    "*/5 * * * * *",
    this.checkTelegramNotifications.bind(this),
    {
      scheduled: false
    }
  );

  async checkTelegramNotifications() {
    try {
      const lock = await this.createLock(4000);
      await lock.acquire(cpz.cronLock.PUBLISHER_SEND_TELEGRAM);
      let timerId = setTimeout(async function tick() {
        await lock.extend(4000);
        timerId = setTimeout(tick, 3000);
      }, 3000);
      const notifications: cpz.Notification[] = await this.broker.call(
        `${cpz.Service.DB_NOTIFICATIONS}.find`,
        {
          query: {
            sendTelegram: true
          },
          sort: "timestamp"
        }
      );

      for (const notification of notifications) {
        const { type, userId } = notification;

        const [user] = await this.broker.call<
          cpz.User[],
          {
            fields: string[];
            query: { [key: string]: any };
          }
        >(`${cpz.Service.DB_USERS}.find`, {
          fields: ["id", "telegramId"],
          query: {
            id: userId,
            status: { $gt: 0 },
            telegramId: { $ne: null }
          }
        });

        let result: { success: boolean; error?: string };
        if (user && user.telegramId) {
          switch (type) {
            case cpz.Event.SIGNAL_ALERT:
              result = await this.handleSignal(notification, user);
              break;
            case cpz.Event.SIGNAL_TRADE:
              result = await this.handleSignal(notification, user);
              break;
            case cpz.Event.USER_EX_ACC_ERROR:
              result = await this.handleUserExAccError(notification, user);
              break;
            case cpz.Event.USER_ROBOT_FAILED:
              result = await this.handleUserRobotFailed(notification, user);
              break;
            case cpz.Event.USER_ROBOT_STARTED:
              result = await this.handleUserRobotStatus(notification, user);
              break;
            case cpz.Event.USER_ROBOT_STOPPED:
              result = await this.handleUserRobotStatus(notification, user);
              break;
            case cpz.Event.USER_ROBOT_PAUSED:
              result = await this.handleUserRobotStatus(notification, user);
              break;
            case cpz.Event.USER_ROBOT_RESUMED:
              result = await this.handleUserRobotStatus(notification, user);
              break;
            case cpz.Event.USER_ROBOT_TRADE:
              result = await this.handleUserRobotTrade(notification, user);
              break;
            case cpz.Event.ORDER_ERROR:
              result = await this.handleOrderError(notification, user);
              break;
            case cpz.Event.MESSAGE_SUPPORT_REPLY:
              result = await this.handleMessageSupportReply(notification, user);
              break;
            case cpz.Event.MESSAGE_BROADCAST:
              result = await this.handleBroadcastMessage(notification, user);
              break;
            default:
              continue;
          }
        } else {
          result = { success: true };
        }
        this.logger.info(result);
        if (result && result.success) {
          await this.broker.call(`${cpz.Service.DB_NOTIFICATIONS}.update`, {
            id: notification.id,
            sendTelegram: false
          });
        }
      }

      clearInterval(timerId);
      await lock.release();
    } catch (e) {
      if (e instanceof this.LockAcquisitionError) return;
      this.logger.error(e);
    }
  }

  async handleBroadcastMessage(notification: cpz.Notification, user: cpz.User) {
    try {
      const {
        data: { message }
      } = notification;

      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId: user.telegramId,
        message
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleMessageSupportReply(
    notification: cpz.Notification,
    user: cpz.User
  ) {
    try {
      const {
        data: { message }
      } = notification;
      const LANG = "en";
      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId: user.telegramId,
        message: this.i18n.t(LANG, "scenes.support.reply", { message })
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleSignal(notification: cpz.Notification, user: cpz.User) {
    try {
      const signal: cpz.SignalEvent = <cpz.SignalEvent>notification.data;

      const { robotId, type, action } = signal;
      const { code } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id: robotId,
        fields: ["id", "code"]
      });

      //TODO: Set lang from DB
      const LANG = "en";
      let message = "";
      const robotInfo = this.i18n.t(LANG, `signal.${type}`, { code });
      const actionText = this.i18n.t(LANG, `tradeAction.${signal.action}`);
      const orderTypeText = this.i18n.t(LANG, `orderType.${signal.orderType}`);

      if (type === cpz.SignalType.alert) {
        const signalText = this.i18n.t(LANG, "robot.signal", {
          code: signal.positionCode,
          timestamp: dayjs.utc(signal.timestamp).format("YYYY-MM-DD HH:mm UTC"),
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
          const position: cpz.RobotPositionState = await this.broker.call(
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
            entryPrice: position.entryPrice,
            entryDate: dayjs
              .utc(position.entryDate)
              .format("YYYY-MM-DD HH:mm UTC"),
            exitAction: actionText,
            exitPrice: +signal.price,
            exitDate: dayjs
              .utc(signal.timestamp)
              .format("YYYY-MM-DD HH:mm UTC"),
            barsHeld: position.barsHeld,
            profit: signal.profit
          });
        } else {
          tradeText = this.i18n.t(LANG, "robot.positionOpen", {
            code: signal.positionCode,
            entryAction: actionText,
            entryPrice: +signal.price,
            entryDate: dayjs
              .utc(signal.timestamp)
              .format("YYYY-MM-DD HH:mm UTC")
          });
        }
        message = `${robotInfo}${tradeText}`;
      }

      return await this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId: user.telegramId,
        message
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleUserExAccError(notification: cpz.Notification, user: cpz.User) {
    try {
      const { name, error } = <cpz.UserExchangeAccountErrorEvent>(
        notification.data
      );

      const LANG = "en";
      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId: user.telegramId,
        message: this.i18n.t(LANG, `userExAcc.error`, {
          name,
          error
        })
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleUserRobotFailed(notification: cpz.Notification, user: cpz.User) {
    try {
      const { userRobotId, jobType, error } = notification.data;

      const { code, telegramId } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );

      const LANG = "en";
      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId,
        message: this.i18n.t(LANG, `userRobot.error`, {
          id: userRobotId,
          code,
          jobType,
          error
        })
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleUserRobotStatus(notification: cpz.Notification, user: cpz.User) {
    try {
      const { userRobotId, message } = notification.data;
      let status: cpz.Status;
      if (notification.type === cpz.Event.USER_ROBOT_STARTED)
        status = cpz.Status.started;
      else if (notification.type === cpz.Event.USER_ROBOT_STOPPED)
        status = cpz.Status.stopped;
      else if (notification.type === cpz.Event.USER_ROBOT_PAUSED)
        status = cpz.Status.paused;
      else if (notification.type === cpz.Event.USER_ROBOT_RESUMED)
        status = cpz.Status.started;
      else throw new Error("Unknown Event Name");

      const { code, telegramId } = await this.brokek.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );
      const LANG = "en";
      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId,
        message: this.i18n.t(LANG, `userRobot.status`, {
          code,
          message: message || "",
          status
        })
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleUserRobotTrade(notification: cpz.Notification, user: cpz.User) {
    try {
      const {
        status,
        userRobotId,
        code,
        asset,
        entryAction,
        entryPrice,
        entryDate,
        entryExecuted,
        exitAction,
        exitPrice,
        exitDate,
        exitExecuted,
        barsHeld,
        profit
      } = notification.data;
      const { code: robotCode, telegramId } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );
      const LANG = "en";
      const info = this.i18n.t(LANG, "userTrade.new", {
        code: robotCode
      });
      let tradeText;
      if (status === cpz.UserPositionStatus.open) {
        tradeText = this.i18n.t(LANG, "userTrade.open", {
          code,
          entryAction: this.i18n.t(LANG, `tradeAction.${entryAction}`),
          entryPrice: +entryPrice,
          entryDate: dayjs.utc(entryDate).format("YYYY-MM-DD HH:mm UTC"),
          volume: entryExecuted,
          asset
        });
      } else {
        tradeText = this.i18n.t(LANG, "userTrade.closed", {
          code,
          volume: entryExecuted,
          asset,
          entryAction: this.i18n.t(LANG, `tradeAction.${entryAction}`),
          entryPrice: +entryPrice,
          entryDate: dayjs.utc(entryDate).format("YYYY-MM-DD HH:mm UTC"),
          exitAction: this.i18n.t(LANG, `tradeAction.${exitAction}`),
          exitPrice: +exitPrice,
          exitDate: dayjs.utc(exitDate).format("YYYY-MM-DD HH:mm UTC"),
          barsHeld,
          profit
        });
      }

      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId,
        message: `${info}${tradeText}`
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleOrderError(notification: cpz.Notification, user: cpz.User) {
    try {
      const { userRobotId, error, exId } = notification.data;
      const { code, telegramId } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );
      const LANG = "en";
      return this.broker.call(`${cpz.Service.TELEGRAM_BOT}.sendMessage`, {
        telegramId,
        message: this.i18n.t(LANG, `userRobot.orderError`, {
          id: userRobotId,
          code,
          exId,
          error
        })
      });
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }
}

export = PublisherService;
