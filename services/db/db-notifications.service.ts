import { Service, ServiceBroker, Context } from "moleculer";
import DbService from "moleculer-db";
import adapterOptions from "../../lib/sql";
import Sequelize from "sequelize";
import Auth from "../../mixins/auth";
import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";
import { v4 as uuid } from "uuid";
import { round } from "../../utils";
import SqlAdapter from "moleculer-db-adapter-sequelize";

class NotificationsService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_NOTIFICATIONS,
      mixins: [DbService, Auth],
      adapter: new SqlAdapter(
        process.env.PG_DBNAME,
        process.env.PG_USER,
        process.env.PG_PWD,
        adapterOptions
      ),
      model: {
        name: "notifications",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          timestamp: {
            type: Sequelize.DATE,
            get: function() {
              const value = this.getDataValue("timestamp");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          userId: { type: Sequelize.UUID, field: "user_id" },
          robotId: { type: Sequelize.UUID, field: "robot_id" },
          userRobotId: { type: Sequelize.UUID, field: "user_robot_id" },
          positionId: { type: Sequelize.UUID, field: "position_id" },
          userPositionId: { type: Sequelize.UUID, field: "user_position_id" },
          type: Sequelize.STRING,
          data: Sequelize.JSONB,
          sendTelegram: {
            type: Sequelize.BOOLEAN,
            field: "send_telegram",
            defaultValue: false
          },
          sendEmail: {
            type: Sequelize.BOOLEAN,
            field: "send_email",
            defaultValue: false
          },
          readed: { type: Sequelize.BOOLEAN, defaultValue: false }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        broadcastMessage: {
          params: {
            message: "string"
          },
          graphql: {
            mutation: "broadcastMessage(message: String!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          handler: this.broadcastMessage
        }
      },
      events: {
        [cpz.Event.SIGNAL_ALERT]: this.handleSignal,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignal,
        [cpz.Event.USER_EX_ACC_ERROR]: this.handleUserExAccError,
        [cpz.Event.USER_ROBOT_FAILED]: this.handleUserRobotFailed,
        [cpz.Event.USER_ROBOT_STARTED]: this.handleUserRobotStatus,
        [cpz.Event.USER_ROBOT_STOPPED]: this.handleUserRobotStatus,
        [cpz.Event.USER_ROBOT_PAUSED]: this.handleUserRobotStatus,
        [cpz.Event.USER_ROBOT_RESUMED]: this.handleUserRobotStatus,
        [cpz.Event.USER_ROBOT_TRADE]: this.handleUserRobotTrade,
        [cpz.Event.ORDER_ERROR]: this.handleOrderError,
        [cpz.Event.MESSAGE_SUPPORT_REPLY]: this.handleMessageSupportReply
      }
    });
  }

  async broadcastMessage(ctx: Context<{ message: string }>) {
    try {
      this.authAction(ctx);
      const userslist = await ctx.call<
        { id: string; telegramId: number; email: string }[],
        {
          fields: string[];
          query: { [key: string]: any };
        }
      >(`${cpz.Service.DB_USERS}.find`, {
        fields: ["id", "telegramId", "email"],
        query: {
          status: { $gt: 0 }
        }
      });

      const notifications: cpz.Notification[] = userslist.map(
        ({ id, telegramId, email }) => ({
          id: uuid(),
          userId: id,
          timestamp: dayjs.utc().toISOString(),
          type: cpz.Event.MESSAGE_BROADCAST,
          data: ctx.params,
          sendTelegram: !!telegramId,
          sendEmail: !!email
        })
      );

      if (notifications.length > 0) {
        await this._insert(ctx, { entities: notifications });
      }
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }

  async handleSignal(ctx: Context<cpz.SignalEvent>) {
    try {
      const signal = ctx.params;

      const { robotId, action } = signal;

      //TODO: email and web notifications
      const subscriptions: {
        telegramId?: number;
        email?: string;
        settings: cpz.UserSettings;
        userId: string;
        volume: number;
        subscribedAt: string;
      }[] = await ctx.call(`${cpz.Service.DB_USER_SIGNALS}.getSubscriptions`, {
        robotId
      });

      let notifications: cpz.Notification[];
      if (
        subscriptions &&
        Array.isArray(subscriptions) &&
        subscriptions.length > 0
      ) {
        if (ctx.eventName === cpz.Event.SIGNAL_ALERT) {
          notifications = subscriptions
            .filter(
              sub =>
                dayjs.utc(signal.candleTimestamp).valueOf() >=
                dayjs.utc(sub.subscribedAt).valueOf()
            )
            .map(sub => ({
              id: uuid(),
              userId: sub.userId,
              timestamp: signal.timestamp,
              type: <cpz.Event>ctx.eventName,
              data: signal,
              robotId: signal.robotId,
              positionId: signal.positionId,
              sendTelegram:
                sub.telegramId && sub.settings.notifications.signals.telegram,
              sendEmail: sub.email && sub.settings.notifications.signals.email
            }));
        } else {
          if (
            action === cpz.TradeAction.closeLong ||
            action === cpz.TradeAction.closeShort
          ) {
            const position: cpz.RobotPositionState = await ctx.call(
              `${cpz.Service.DB_ROBOT_POSITIONS}.get`,
              {
                id: signal.positionId
              }
            );
            notifications = subscriptions
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
                return {
                  id: uuid(),
                  userId: sub.userId,
                  timestamp: signal.timestamp,
                  type: <cpz.Event>ctx.eventName,
                  data: { ...signal, profit },
                  robotId: signal.robotId,
                  positionId: signal.positionId,
                  sendTelegram:
                    sub.telegramId &&
                    sub.settings.notifications.signals.telegram,
                  sendEmail:
                    sub.email && sub.settings.notifications.signals.email
                };
              });
          } else {
            notifications = subscriptions.map(sub => ({
              id: uuid(),
              userId: sub.userId,
              timestamp: signal.timestamp,
              type: <cpz.Event>ctx.eventName,
              data: signal,
              robotId: signal.robotId,
              positionId: signal.positionId,
              sendTelegram:
                sub.telegramId && sub.settings.notifications.signals.telegram,
              sendEmail: sub.email && sub.settings.notifications.signals.email
            }));
          }
        }

        if (notifications.length > 0) {
          await this._insert(ctx, { entities: notifications });
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleUserExAccError(ctx: Context<cpz.UserExchangeAccountErrorEvent>) {
    try {
      const { userId } = ctx.params;
      const user: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        fields: ["id", "telegramId", "email"],
        id: userId
      });

      const notification: cpz.Notification = {
        id: uuid(),
        userId,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: ctx.params,
        sendTelegram: !!user.telegramId,
        sendEmail: !!user.email
      };
      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleUserRobotFailed(
    ctx: Context<{
      userRobotId: string;
      jobType: cpz.UserRobotJobType;
      error: string;
    }>
  ) {
    try {
      const { userRobotId } = ctx.params;

      const { telegramId, email, userId } = await ctx.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );

      const notification: cpz.Notification = {
        id: uuid(),
        userId,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: ctx.params,
        userRobotId,
        sendTelegram: !!telegramId,
        sendEmail: !!email
      };
      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleUserRobotStatus(
    ctx: Context<{
      userRobotId: string;
      message?: string;
    }>
  ) {
    try {
      const { userRobotId } = ctx.params;
      let status: cpz.Status;
      if (ctx.eventName === cpz.Event.USER_ROBOT_STARTED)
        status = cpz.Status.started;
      else if (ctx.eventName === cpz.Event.USER_ROBOT_STOPPED)
        status = cpz.Status.stopped;
      else if (ctx.eventName === cpz.Event.USER_ROBOT_PAUSED)
        status = cpz.Status.paused;
      else if (ctx.eventName === cpz.Event.USER_ROBOT_RESUMED)
        status = cpz.Status.started;
      else throw new Error("Unknown Event Name");

      const { telegramId, email, userId } = await ctx.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );
      const notification: cpz.Notification = {
        id: uuid(),
        userId,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: ctx.params,
        userRobotId,
        sendTelegram: !!telegramId,
        sendEmail: !!email
      };
      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleUserRobotTrade(ctx: Context<cpz.UserTradeEventData>) {
    try {
      const { id, userId, userRobotId } = ctx.params;
      const {
        telegramId,
        email,
        settings: {
          notifications: {
            trading: { telegram: tradingTelegram, email: tradingEmail }
          }
        }
      }: cpz.User = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: userId,
        fields: ["email", "telegramId", "settings"]
      });

      const notification: cpz.Notification = {
        id: uuid(),
        userId,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: ctx.params,
        userRobotId,
        userPositionId: id,
        sendTelegram: telegramId && tradingTelegram,
        sendEmail: email && tradingEmail
      };

      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleOrderError(ctx: Context<cpz.Order>) {
    try {
      const { userRobotId, userPositionId } = ctx.params;
      const { telegramId, email, userId } = await ctx.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobotEventInfo`,
        {
          id: userRobotId
        }
      );
      const notification: cpz.Notification = {
        id: uuid(),
        userId,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: ctx.params,
        userRobotId,
        userPositionId,
        sendTelegram: !!telegramId,
        sendEmail: !!email
      };

      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async handleMessageSupportReply(
    ctx: Context<{ to: string; data: { message: string } }>
  ) {
    try {
      const { to, data } = ctx.params;
      const { telegramId, email } = await ctx.call(
        `${cpz.Service.DB_USERS}.get`,
        {
          id: to,
          fields: ["id", "telegramId", "email"]
        }
      );
      const notification: cpz.Notification = {
        id: uuid(),
        userId: to,
        timestamp: dayjs.utc().toISOString(),
        type: <cpz.Event>ctx.eventName,
        data: data,
        sendTelegram: !!telegramId,
        sendEmail: !!email
      };

      await this._insert(ctx, {
        entity: notification
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export = NotificationsService;
