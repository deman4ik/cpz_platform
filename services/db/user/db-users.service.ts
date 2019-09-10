import { Service, ServiceBroker, Errors, Context } from "moleculer";
import DbService from "moleculer-db";
import SqlAdapter from "../../../lib/sql";
import Sequelize from "sequelize";
import { cpz } from "../../../types/cpz";

class UsersService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: cpz.Service.DB_USERS,
      mixins: [DbService],
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
          registrationCode: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "registration_code"
          },
          refreshToken: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "refresh_token"
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
      }
    });
  }
}

export = UsersService;
