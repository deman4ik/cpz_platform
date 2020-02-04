import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../@types";
import Auth from "../../../mixins/auth";

class UsersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USERS,
      mixins: [DbService, Auth],
      adapter: SqlAdapter,
      model: {
        name: "users",
        define: {
          id: { type: Sequelize.UUID, primaryKey: true },
          name: { type: Sequelize.STRING, allowNull: true },
          email: { type: Sequelize.STRING, allowNull: true },
          telegramId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: "telegram_id"
          },
          telegramUsername: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "telegram_username"
          },
          status: Sequelize.INTEGER,
          passwordHash: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "password_hash"
          },
          secretCode: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "secret_code"
          },
          secretCodeExpireAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "secret_code_expire_at",
            get: function() {
              const value = this.getDataValue("secretCodeExpireAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          refreshToken: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "refresh_token"
          },
          refreshTokenExpireAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "refresh_token_expire_at",
            get: function() {
              const value = this.getDataValue("refreshTokenExpireAt");
              return (
                (value && value instanceof Date && value.toISOString()) || value
              );
            }
          },
          roles: { type: Sequelize.JSONB },
          settings: { type: Sequelize.JSONB }
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        setNotificationSettings: {
          params: {
            signalsTelegram: { type: "boolean", optional: true },
            signalsEmail: { type: "boolean", optional: true },
            tradingTelegram: { type: "boolean", optional: true },
            tradingEmail: { type: "boolean", optional: true }
          },
          graphql: {
            mutation:
              "setNotificationSettings(signalsTelegram: Boolean, tradingTelegram: Boolean, signalsEmail: Boolean, tradingEmail: Boolean): Response!"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: this.authAction
          },
          handler: this.setNotificationSettings
        }
      }
    });
  }
  async setNotificationSettings(
    ctx: Context<
      {
        signalsTelegram?: boolean;
        signalsEmail?: boolean;
        tradingTelegram?: boolean;
        tradingEmail?: boolean;
      },
      { user: cpz.User }
    >
  ) {
    try {
      const {
        signalsEmail,
        signalsTelegram,
        tradingEmail,
        tradingTelegram
      } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const { settings }: cpz.User = await this.adapter.findById(userId);
      const newSettings = {
        ...settings,
        notifications: {
          signals: {
            telegram:
              signalsTelegram === true || signalsTelegram === false
                ? signalsTelegram
                : settings.notifications.signals.telegram,
            email:
              signalsEmail === true || signalsEmail === false
                ? signalsEmail
                : settings.notifications.signals.email
          },
          trading: {
            telegram:
              tradingTelegram === true || tradingTelegram === false
                ? tradingTelegram
                : settings.notifications.trading.telegram,
            email:
              tradingEmail === true || tradingEmail === false
                ? tradingEmail
                : settings.notifications.trading.email
          }
        }
      };
      await this.adapter.updateById(userId, {
        $set: {
          settings: newSettings
        }
      });
      return { success: true, result: newSettings };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }
}

export = UsersService;
