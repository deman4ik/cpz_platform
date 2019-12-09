import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import Telegraf, { Extra } from "telegraf";
import Stage from "telegraf/stage";
const { enter, leave } = Stage;
import Scene from "telegraf/scenes/base";
import TelegrafI18n, { match, reply } from "telegraf-i18n";
import Session from "telegraf-session-redis";
import path from "path";
import cron from "node-cron";
import { getMainKeyboard } from "../../state/telegram/keyboard";
import { sleep } from "../../utils/helpers";

import {
  signalsEnter,
  signalsMySignals,
  signalsSearchSignals,
  signalsLeave,
  searchSignalsEnter,
  searchSignalsSelectedAsset,
  searchSignalsSelectedRobot,
  searchSignalsBack,
  searchSignalsLeave,
  mySignalsEnter,
  mySignalsSelectedRobot,
  mySignalsBack,
  mySignalsLeave,
  perfSignalsEnter,
  perfSignalsBack,
  perfSignalsLeave,
  robotSignalInfo,
  robotSignalPublicStats,
  robotSignalMyStats,
  robotSignalPositions,
  robotSignalSubscribe,
  robotSignalUnsubscribe,
  robotSignalBack,
  robotSignalLeave,
  signalsSubscribeEnter,
  signalsSubscribeConfirm,
  signalsSubscribeBack,
  signalsSubscribeLeave,
  faqEnter,
  faqSelected,
  faqLeave,
  signalsPerfSignals
} from "../../state/telegram/scenes";

//TODO: Logging
class BotService extends Service {
  bot: any;
  messages: cpz.TelegramMessage[] = [];
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: cpz.Service.TELEGRAM_BOT,
      dependencies: [
        `${cpz.Service.AUTH}`,
        `${cpz.Service.DB_ROBOTS}`,
        `${cpz.Service.DB_USER_SIGNALS}`
      ],
      created: this.createdService,
      started: this.startedService,
      stopped: this.stoppedService,
      actions: {
        sendMessage: {
          params: {
            entity: {
              type: "object",
              props: {
                telegramId: "number",
                message: "string"
              },
              optional: true
            },
            entities: {
              type: "array",
              items: {
                type: "object",
                props: {
                  telegramId: "number",
                  message: "string"
                }
              },
              optional: true
            }
          },
          handler: this.sendMessage
        }
      }
    });
  }

  cronJobs: cron.ScheduledTask = cron.schedule(
    "*/5 * * * * *",
    this.sendMessages.bind(this),
    {
      scheduled: false
    }
  );

  sendMessage(
    ctx: Context<{
      entity: cpz.TelegramMessage;
      entities: cpz.TelegramMessage[];
    }>
  ) {
    const { entity, entities } = ctx.params;
    if (entity) this.messages.push(entity);
    else if (entities && Array.isArray(entities) && entities.length > 0)
      this.messages = [...this.messages, ...entities];
  }

  async sendMessages() {
    if (this.messages.length > 0) {
      const msgs = [...this.messages];
      this.messages.splice(0, msgs.length);
      for (const { telegramId, message } of msgs) {
        try {
          await this.bot.telegram.sendMessage(telegramId, message, {
            parse_mode: "HTML"
          });
          await sleep(100);
        } catch (err) {
          this.logger.error(err);
          this.blockHandler(telegramId, err.response);
        }
      }
    }
  }

  createdService() {
    const session = new Session({
      store: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      },
      getSessionKey: this.getSessionKey.bind(this)
    });
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.bot.catch((err: any) => {
      this.logger.error(err);
    });
    this.bot.use(session);
    this.i18n = new TelegrafI18n({
      defaultLanguage: "en",
      useSession: true,
      defaultLanguageOnMissing: true,
      directory: path.resolve(process.cwd(), "state/telegram/locales")
    });
    this.bot.use(this.i18n.middleware());

    const signalsScene = new Scene(cpz.TelegramScene.SIGNALS);
    signalsScene.enter(signalsEnter.bind(this));
    signalsScene.leave(signalsLeave.bind(this));
    signalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    signalsScene.command("back", leave());
    signalsScene.action(/mySignals/, signalsMySignals.bind(this));
    signalsScene.action(/searchSignals/, signalsSearchSignals.bind(this));
    signalsScene.action(/perfSignals/, signalsPerfSignals.bind(this));

    const searchSignalsScene = new Scene(cpz.TelegramScene.SEARCH_SIGNALS);
    searchSignalsScene.enter(searchSignalsEnter.bind(this));
    searchSignalsScene.leave(searchSignalsLeave.bind(this));
    searchSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      searchSignalsBack.bind(this)
    );
    searchSignalsScene.command("back", searchSignalsBack.bind(this));
    searchSignalsScene.action(/asset/, searchSignalsSelectedAsset.bind(this));
    searchSignalsScene.action(/robot/, searchSignalsSelectedRobot.bind(this));

    const mySignalsScene = new Scene(cpz.TelegramScene.MY_SIGNALS);
    mySignalsScene.enter(mySignalsEnter.bind(this));
    mySignalsScene.leave(mySignalsLeave.bind(this));
    mySignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      mySignalsBack.bind(this)
    );
    mySignalsScene.command("back", mySignalsBack.bind(this));
    mySignalsScene.action(/robot/, mySignalsSelectedRobot.bind(this));

    const perfSignalsScene = new Scene(cpz.TelegramScene.PERFOMANCE_SIGNALS);
    perfSignalsScene.enter(perfSignalsEnter.bind(this));
    perfSignalsScene.leave(perfSignalsLeave.bind(this));
    perfSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      perfSignalsBack.bind(this)
    );
    perfSignalsScene.command("back", perfSignalsBack.bind(this));
    perfSignalsScene.action(/back/, perfSignalsBack.bind(this));

    const robotSignalScene = new Scene(cpz.TelegramScene.ROBOT_SIGNAL);
    robotSignalScene.enter(robotSignalInfo.bind(this));
    robotSignalScene.leave(robotSignalLeave.bind(this));
    robotSignalScene.hears(
      match("keyboards.backKeyboard.back"),
      robotSignalBack.bind(this)
    );
    robotSignalScene.command("back", robotSignalBack.bind(this));
    robotSignalScene.action(/info/, robotSignalInfo.bind(this));
    robotSignalScene.action(/pStat/, robotSignalPublicStats.bind(this));
    robotSignalScene.action(/myStat/, robotSignalMyStats.bind(this));
    robotSignalScene.action(/pos/, robotSignalPositions.bind(this));
    robotSignalScene.action(/unsubscribe/, robotSignalUnsubscribe.bind(this));
    robotSignalScene.action(/subscribe/, robotSignalSubscribe.bind(this));
    robotSignalScene.action(/changeVolume/, robotSignalSubscribe.bind(this));

    const signalsSubscribe = new Scene(cpz.TelegramScene.SUBSCRIBE_SIGNALS);
    signalsSubscribe.enter(signalsSubscribeEnter.bind(this));
    signalsSubscribe.leave(signalsSubscribeLeave.bind(this));
    signalsSubscribe.hears(
      match("keyboards.backKeyboard.back"),
      signalsSubscribeBack.bind(this)
    );
    signalsSubscribe.command("back", signalsSubscribeBack.bind(this));
    signalsSubscribe.hears(/(.*?)/, signalsSubscribeConfirm.bind(this));

    const faqScene = new Scene(cpz.TelegramScene.FAQ);
    faqScene.enter(faqEnter.bind(this));
    faqScene.leave(faqLeave.bind(this));
    faqScene.hears(match("keyboards.backKeyboard.back"), leave());
    faqScene.command("back", leave());
    faqScene.action(/q/, faqSelected.bind(this));

    const stage = new Stage([
      signalsScene,
      searchSignalsScene,
      mySignalsScene,
      perfSignalsScene,
      robotSignalScene,
      signalsSubscribe,
      faqScene
    ]);

    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());
    this.bot.start(this.start.bind(this));
    // Main menu
    this.bot.hears(
      match("keyboards.mainKeyboard.signals"),
      enter(cpz.TelegramScene.SIGNALS)
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.robots"),
      enter(cpz.TelegramScene.MY_SIGNALS)
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.faq"),
      enter(cpz.TelegramScene.FAQ)
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.contact"),
      reply("contact", Extra.HTML())
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.donation"),
      reply("donation", Extra.HTML())
    );

    this.bot.hears(/(.*?)/, this.defaultHandler.bind(this));
  }

  /*****************************
   *  Service hooks
   *****************************/

  async startedService() {
    if (process.env.NODE_ENV === "production") {
      await this.bot.telegram.setWebhook(process.env.BOT_HOST);
      await this.bot.startWebhook("/", null, 5000);
      this.cronJobs.start();
      this.logger.warn("Bot in production mode!");
    } else if (
      process.env.NODE_ENV === "dev" ||
      process.env.NODE_ENV === "development"
    ) {
      await this.bot.telegram.deleteWebhook();
      await this.bot.startPolling();
      this.cronJobs.start();
      this.logger.warn("Bot in development mode!");
    } else {
      this.logger.warn("Bot not started!");
    }
  }

  async stoppedService() {
    this.cronJobs.stop();
    this.bot.stop();
  }

  /*****************************
   *  Helpers
   *****************************/

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

  /*****************************
   *  Bot Middlewares
   *****************************/

  async auth(ctx: any, next: () => any) {
    const sessionData = ctx.session;
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

  /*****************************
   *  Bot commands
   *****************************/

  async start(ctx: any) {
    try {
      const params = ctx.update.message.text.replace("/start ", "");
      if (params && params !== "") {
        const [scene, robotId] = params.split("_");
        if (scene && robotId && scene === cpz.TelegramScene.ROBOT_SIGNAL) {
          //TODO: check access to robot
        }
      }
      this.logger.info();
      return ctx.reply(
        ctx.i18n.t("welcome", {
          username: this.formatName(ctx)
        }),
        getMainKeyboard(ctx)
      );
    } catch (e) {
      this.logger.error(e);
      return ctx.reply(ctx.i18n.t("failed"));
    }
  }

  async blockHandler(
    telegramId: number,
    error: { ok: boolean; error_code: number; description: string }
  ) {
    try {
      this.logger.warn(telegramId, error);
      if (
        error &&
        error.ok === false &&
        error.error_code === 403 &&
        error.description === "Forbidden: bot was blocked by the user"
      ) {
        const [user] = await this.broker.call(`${cpz.Service.DB_USERS}.find`, {
          fields: ["id"],
          query: { telegramId }
        });

        if (user) {
          const { id: userId } = user;
          await this.broker.call(
            `${cpz.Service.DB_USERS}.setNotificationSettings`,
            {
              userId,
              signalsTelegram: false,
              tradingTelegram: false
            }
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async mainMenu(ctx: any) {
    await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
  }

  async defaultHandler(ctx: any) {
    await ctx.reply(ctx.i18n.t("defaultHandler"), getMainKeyboard(ctx));
  }
}

export = BotService;
