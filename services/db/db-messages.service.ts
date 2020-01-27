import { Service, ServiceBroker, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../@types";
import Auth from "../../mixins/auth";
import { v4 as uuid } from "uuid";
import dayjs from "../../lib/dayjs";

class MessagesService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_MESSAGES,
      mixins: [Auth, DbService],
      adapter: SqlAdapter,
      model: {
        name: "messages",
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
          from: Sequelize.STRING,
          to: { type: Sequelize.STRING, allowNull: true },
          data: Sequelize.JSONB
        },
        options: {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at"
        }
      },
      actions: {
        supportMessage: {
          params: {
            message: "string"
          },
          roles: [cpz.UserRoles.user],
          hooks: {
            before: "authAction"
          },
          handler: this.supportMessage
        },
        replySupportMessage: {
          params: {
            to: "string",
            message: "string"
          },
          graphql: {
            mutation:
              "replySupportMessage(to: String!, message: String!): Response!"
          },
          roles: [cpz.UserRoles.admin],
          hooks: {
            before: "authAction"
          },
          handler: this.replySupportMessage
        }
      }
    });
  }

  async supportMessage(ctx: Context<{ message: string }, { user: cpz.User }>) {
    try {
      const { message } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const newMessage: cpz.Message = {
        id: uuid(),
        from: userId,
        data: { message },
        timestamp: dayjs.utc().toISOString()
      };

      //TODO: notification to admins
      //TODO: ticket system
      await this.adapter.insert(newMessage);
      await ctx.broker.call(`${cpz.Service.MAIL}.send`, {
        to: "support@cryptuoso.com",
        subject: `New Support Request from user ${userId}`,
        variables: {
          body: `<p>New Support Request from user <b>${userId}</b></p>
                <p>${message}</p>
                <p>${newMessage.timestamp}</p>
                `
        },
        tags: ["support"]
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  async replySupportMessage(
    ctx: Context<{ to: string; message: string }, { user: cpz.User }>
  ) {
    try {
      const { to, message } = ctx.params;
      const { id: userId } = ctx.meta.user;
      const userTo = await ctx.call(`${cpz.Service.DB_USERS}.get`, {
        id: to,
        fields: ["id"]
      });
      if (!userTo) throw new Error(`Failed to find user ${to}`);

      const newMessage: cpz.Message = {
        id: uuid(),
        from: userId,
        to,
        data: { message },
        timestamp: dayjs.utc().toISOString()
      };

      await this.adapter.insert(newMessage);
      await ctx.emit(cpz.Event.MESSAGE_SUPPORT_REPLY, newMessage);
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
    }
  }
}

export = MessagesService;
