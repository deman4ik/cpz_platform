import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../types/cpz";
import Telegraf, {
  Context as TContext,
  Telegram,
  Markup,
  Extra
} from "telegraf";
import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";
import TelegrafI18n, { match } from "telegraf-i18n";
import Session from "telegraf-session-redis";
import path from "path";
import {
  getMainKeyboard,
  getBackKeyboard
} from "../../state/telegram/keyboard";
import { Op } from "sequelize";
import { getAssetsMenu, getSignalsMenu } from "../../state/telegram/menu";

const { enter, leave } = Stage;

class BotService extends Service {
  bot: any;
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "telegram-bot",
      dependencies: [
        `${cpz.Service.AUTH}`,
        `${cpz.Service.DB_ROBOTS}`,
        `${cpz.Service.DB_USER_SIGNALS}`
      ],
      created: this.createdService,
      started: this.startedService,
      stopped: this.stoppedService
    });
  }

  createdService() {
    const session = new Session({
      store: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      },
      getSessionKey: this.getSessionKey.bind(this)
    });
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.bot.catch((err: any) => {
      this.logger.error(err);
    });
    this.bot.use(session);
    const i18n = new TelegrafI18n({
      defaultLanguage: "en",
      useSession: true,
      defaultLanguageOnMissing: true,
      directory: path.resolve(process.cwd(), "state/telegram/locales")
    });
    this.bot.use(i18n.middleware());
    const signalsScene = new Scene("signals");
    signalsScene.enter(this.signalsEnter.bind(this));
    signalsScene.leave(this.signalsLeave.bind(this));
    signalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    signalsScene.command("back", leave());
    signalsScene.action(/asset/, this.signalsSelectedAsset.bind(this));
    signalsScene.action(/robot/, this.signalsSelectedRobot.bind(this));
    signalsScene.action(/.+/, this.signalsButton.bind(this));

    const stage = new Stage([signalsScene]);
    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());

    this.bot.start(this.start.bind(this));
    this.bot.hears(match("keyboards.mainKeyboard.signals"), enter("signals"));
    this.bot.hears(
      match("keyboards.mainKeyboard.mySignals"),
      this.mySignals.bind(this)
    );
    this.bot.hears(/(.*?)/, this.defaultHandler.bind(this));
  }

  async startedService() {
    if (process.env.NODE_ENV === "dev") {
      this.logger.warn("Bot in development mode!");
      await this.bot.telegram.deleteWebhook();
      await this.bot.startPolling();
    } else {
      await this.bot.telegram.setWebhook(`${process.env.BOT_HOST}/tgendpoint`);
      await this.bot.startWebhook("/tgendpoint", null, 5000);
    }
  }

  async stoppedService() {
    this.bot.stop();
  }

  getSessionKey(ctx: any) {
    if (ctx.from && ctx.chat) {
      return `${ctx.from.id}:${ctx.chat.id}`;
    } else if (ctx.from && ctx.inlineQuery) {
      return `${ctx.from.id}:${ctx.from.id}`;
    }
    return null;
  }

  formatName(ctx: any) {
    return ctx.from.first_name || ctx.from.last_name
      ? `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim()
      : ctx.from.username;
  }

  async auth(ctx: any, next: () => any) {
    const sessionData = ctx.session;
    this.logger.info(sessionData);
    if (!sessionData || !sessionData.user) {
      const user = await this.broker.call(`${cpz.Service.AUTH}.registerTg`, {
        telegramId: ctx.from.id,
        telegramUsername: ctx.from.username,
        name: this.formatName(ctx)
      });
      ctx.session.user = user;
    }
    await next();
  }

  async start(ctx: any) {
    try {
      this.logger.info(ctx.from, ctx.chat);
      const { mainKeyboard } = getMainKeyboard(ctx);
      return ctx.reply(
        ctx.i18n.t("welcome", {
          username: this.formatName(ctx)
        }),
        mainKeyboard
      );
    } catch (e) {
      this.logger.error(e);
      return ctx.reply("");
    }
  }

  async mySignals(ctx: any) {
    ctx.reply("my signals");
  }

  /*****************************
   *  Signals actions
   *****************************/

  async signalsEnter(ctx: any) {
    try {
      const assets: {
        asset: string;
        currency: string;
      }[] = await this.broker.call(
        `${cpz.Service.DB_ROBOTS}.getAvailableSignalAssets`
      );
      const { backKeyboard } = getBackKeyboard(ctx);
      await ctx.reply("🤖", backKeyboard);
      if (!assets || !Array.isArray(assets) || assets.length < 0) {
        throw new Error("Failed to load signal assets");
      }
      return ctx.reply(
        ctx.i18n.t("scenes.signals.selectAsset"),
        getAssetsMenu(assets)
      );
    } catch (e) {
      this.logger.error(e);
      leave("signals");
      return ctx.reply(ctx.i18n.t("failed"));
    }
  }

  async signalsLeave(ctx: any) {
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("menu"), mainKeyboard);
  }

  async signalsButton(ctx: any) {
    this.logger.info("signalsButton", ctx.match);
    return ctx.answerCbQuery(ctx.match[0]);
  }

  async signalsSelectedAsset(ctx: any) {
    const { p: selectedAsset } = JSON.parse(ctx.callbackQuery.data);
    const [asset, currency] = selectedAsset.split("/");
    const robots = await this.broker.call(`${cpz.Service.DB_ROBOTS}.find`, {
      fields: ["id", "code"],
      query: {
        available: { [Op.gte]: 20 },
        asset,
        currency
      }
    });
    this.logger.info(robots);
    if (!robots || !Array.isArray(robots) || robots.length === 0) {
      throw new Error("Failed to load signal robots");
    }
    return ctx.editMessageText(
      ctx.i18n.t("scenes.signals.selectRobot", { asset: selectedAsset }),
      getSignalsMenu(robots)
    );
  }

  async signalsSelectedRobot(ctx: any) {
    const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
    return ctx.answerCbQuery(robotId);
  }

  async defaultHandler(ctx: any) {
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("defaultHandler"), mainKeyboard);
  }
}

export = BotService;
