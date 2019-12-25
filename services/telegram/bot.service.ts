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
  addUserExAccEnter,
  addUserExAccSelectedExchange,
  addUserExAccSubmited,
  addUserExAccBack,
  addUserExAccLeave,
  addUserRobotEnter,
  addUserRobotSelectedAcc,
  addUserRobotConfirm,
  addUserRobotBack,
  addUserRobotLeave,
  deleteUserRobotEnter,
  deleteUserRobotYes,
  deleteUserRobotBack,
  deleteUserRobotLeave,
  editUserExAccEnter,
  editUserExAccSubmited,
  editUserExAccBack,
  editUserExAccLeave,
  editUserRobotEnter,
  editUserRobotConfirm,
  editUserRobotBack,
  editUserRobotLeave,
  faqEnter,
  faqSelected,
  faqLeave,
  myRobotsEnter,
  myRobotsSelectedRobot,
  myRobotsBack,
  myRobotsLeave,
  mySignalsEnter,
  mySignalsSelectedRobot,
  mySignalsBack,
  mySignalsLeave,
  perfSignalsEnter,
  perfSignalsBack,
  perfSignalsLeave,
  perfRobotsEnter,
  perfRobotsBack,
  perfRobotsLeave,
  robotsEnter,
  robotsMyRobots,
  robotsSearchRobots,
  robotsPerfRobots,
  robotsLeave,
  robotSignalInfo,
  robotSignalPublicStats,
  robotSignalMyStats,
  robotSignalPositions,
  robotSignalSubscribe,
  robotSignalUnsubscribe,
  robotSignalBack,
  robotSignalLeave,
  searchRobotsEnter,
  searchRobotsSelectAsset,
  searchRobotsSelectRobot,
  searchRobotsOpenRobot,
  searchRobotsBack,
  searchRobotsLeave,
  searchSignalsEnter,
  searchSignalsSelectAsset,
  searchSignalsSelectRobot,
  searchSignalsOpenRobot,
  searchSignalsBack,
  searchSignalsLeave,
  settingsEnter,
  settingsUserExAccs,
  settingsLeave,
  signalsEnter,
  signalsMySignals,
  signalsSearchSignals,
  signalsPerfSignals,
  signalsLeave,
  startUserRobotEnter,
  startUserRobotYes,
  startUserRobotBack,
  startUserRobotLeave,
  stopUserRobotEnter,
  stopUserRobotYes,
  stopUserRobotBack,
  stopUserRobotLeave,
  subscribeSignalsEnter,
  subscribeSignalsConfirm,
  subscribeSignalsBack,
  subscribeSignalsLeave,
  userExAccEnter,
  userExAccEdit,
  userExAccDelete,
  userExAccBack,
  userExAccLeave,
  userExAccsEnter,
  userExAccsSelectedAcc,
  userExAccsAddAcc,
  userExAccsBack,
  userExAccsLeave,
  userRobotInfo,
  userRobotPublicStats,
  userRobotMyStats,
  userRobotPositions,
  userRobotAdd,
  userRobotDelete,
  userRobotEdit,
  userRobotStart,
  userRobotStop,
  userRobotBack,
  userRobotLeave
} from "../../state/telegram/scenes";
import { subscribe } from "graphql";

//TODO: Logging
class BotService extends Service {
  bot: any;
  messages: cpz.TelegramMessage[] = [];
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: cpz.Service.TELEGRAM_BOT,
      dependencies: [
        cpz.Service.AUTH,
        cpz.Service.DB_ROBOTS,
        cpz.Service.DB_USER_SIGNALS,
        cpz.Service.DB_USER_ROBOTS,
        cpz.Service.DB_EXCHANGES,
        cpz.Service.DB_USER_EXCHANGE_ACCS,
        cpz.Service.USER_ROBOT_RUNNER
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

    const addUserExAccScene = new Scene(cpz.TelegramScene.ADD_USER_EX_ACC);
    addUserExAccScene.enter(addUserExAccEnter.bind(this));
    addUserExAccScene.leave(addUserExAccLeave.bind(this));
    addUserExAccScene.hears(
      match("keyboards.backKeyboard.back"),
      addUserExAccBack.bind(this)
    );
    addUserExAccScene.command("back", leave());
    addUserExAccScene.command("exit", leave());
    addUserExAccScene.action(
      /exchange/,
      addUserExAccSelectedExchange.bind(this)
    );
    addUserExAccScene.hears(/(.*?)/, addUserExAccSubmited.bind(this));

    const addUserRobotScene = new Scene(cpz.TelegramScene.ADD_USER_ROBOT);
    addUserRobotScene.enter(addUserRobotEnter.bind(this));
    addUserRobotScene.leave(addUserRobotLeave.bind(this));
    addUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      addUserRobotBack.bind(this)
    );
    addUserRobotScene.command("back", leave());
    addUserRobotScene.command("exit", leave());
    addUserRobotScene.action(/userExAcc/, addUserRobotSelectedAcc.bind(this));
    addUserRobotScene.hears(/(.*?)/, addUserRobotConfirm.bind(this));

    const deleteUserRobotScene = new Scene(cpz.TelegramScene.DELETE_USER_ROBOT);
    deleteUserRobotScene.enter(deleteUserRobotEnter.bind(this));
    deleteUserRobotScene.leave(deleteUserRobotLeave.bind(this));
    deleteUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      deleteUserRobotBack.bind(this)
    );
    deleteUserRobotScene.command("back", leave());
    deleteUserRobotScene.command("exit", leave());
    deleteUserRobotScene.action(/yes/, deleteUserRobotYes.bind(this));
    deleteUserRobotScene.action(/no/, deleteUserRobotBack.bind(this));

    const editUserExAccScene = new Scene(cpz.TelegramScene.EDIT_USER_EX_ACC);
    editUserExAccScene.enter(editUserExAccEnter.bind(this));
    editUserExAccScene.leave(editUserExAccLeave.bind(this));
    editUserExAccScene.hears(
      match("keyboards.backKeyboard.back"),
      editUserExAccBack.bind(this)
    );
    editUserExAccScene.command("back", leave());
    editUserExAccScene.command("exit", leave());
    editUserExAccScene.hears(/(.*?)/, editUserExAccSubmited.bind(this));

    const editUserRobotScene = new Scene(cpz.TelegramScene.EDIT_USER_ROBOT);
    editUserRobotScene.enter(editUserRobotEnter.bind(this));
    editUserRobotScene.leave(editUserRobotLeave.bind(this));
    editUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      editUserRobotBack.bind(this)
    );
    editUserRobotScene.command("back", leave());
    editUserRobotScene.command("exit", leave());
    editUserRobotScene.hears(/(.*?)/, editUserRobotConfirm.bind(this));

    const faqScene = new Scene(cpz.TelegramScene.FAQ);
    faqScene.enter(faqEnter.bind(this));
    faqScene.leave(faqLeave.bind(this));
    faqScene.hears(match("keyboards.backKeyboard.back"), leave());
    faqScene.command("back", leave());
    faqScene.command("exit", leave());
    faqScene.action(/q/, faqSelected.bind(this));

    const myRobotsScene = new Scene(cpz.TelegramScene.MY_ROBOTS);
    myRobotsScene.enter(myRobotsEnter.bind(this));
    myRobotsScene.leave(myRobotsLeave.bind(this));
    myRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      myRobotsBack.bind(this)
    );
    myRobotsScene.command("back", leave());
    myRobotsScene.command("exit", leave());
    myRobotsScene.action(/robot/, myRobotsSelectedRobot.bind(this));

    const mySignalsScene = new Scene(cpz.TelegramScene.MY_SIGNALS);
    mySignalsScene.enter(mySignalsEnter.bind(this));
    mySignalsScene.leave(mySignalsLeave.bind(this));
    mySignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      mySignalsBack.bind(this)
    );
    mySignalsScene.command("back", leave());
    mySignalsScene.command("exit", leave());
    mySignalsScene.action(/robot/, mySignalsSelectedRobot.bind(this));

    const perfSignalsScene = new Scene(cpz.TelegramScene.PERFOMANCE_SIGNALS);
    perfSignalsScene.enter(perfSignalsEnter.bind(this));
    perfSignalsScene.leave(perfSignalsLeave.bind(this));
    perfSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      perfSignalsBack.bind(this)
    );
    perfSignalsScene.command("back", leave());
    perfSignalsScene.command("exit", leave());
    perfSignalsScene.action(/back/, perfSignalsBack.bind(this));

    const perfRobotsScene = new Scene(cpz.TelegramScene.PERFOMANCE_ROBOTS);
    perfRobotsScene.enter(perfRobotsEnter.bind(this));
    perfRobotsScene.leave(perfRobotsLeave.bind(this));
    perfRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      perfRobotsBack.bind(this)
    );
    perfRobotsScene.command("back", leave());
    perfRobotsScene.command("exit", leave());
    perfRobotsScene.action(/back/, perfRobotsBack.bind(this));

    const robotsScene = new Scene(cpz.TelegramScene.ROBOTS);
    robotsScene.enter(robotsEnter.bind(this));
    robotsScene.leave(robotsLeave.bind(this));
    robotsScene.hears(match("keyboards.backKeyboard.back"), leave());
    robotsScene.command("back", leave());
    robotsScene.command("exit", leave());
    robotsScene.action(/myRobots/, robotsMyRobots.bind(this));
    robotsScene.action(/searchRobots/, robotsSearchRobots.bind(this));
    robotsScene.action(/perfRobots/, robotsPerfRobots.bind(this));

    const robotSignalScene = new Scene(cpz.TelegramScene.ROBOT_SIGNAL);
    robotSignalScene.enter(robotSignalInfo.bind(this));
    robotSignalScene.leave(robotSignalLeave.bind(this));
    robotSignalScene.hears(
      match("keyboards.backKeyboard.back"),
      robotSignalBack.bind(this)
    );
    robotSignalScene.command("back", leave());
    robotSignalScene.command("exit", leave());
    robotSignalScene.action(/info/, robotSignalInfo.bind(this));
    robotSignalScene.action(/pStat/, robotSignalPublicStats.bind(this));
    robotSignalScene.action(/myStat/, robotSignalMyStats.bind(this));
    robotSignalScene.action(/pos/, robotSignalPositions.bind(this));
    robotSignalScene.action(/unsubscribe/, robotSignalUnsubscribe.bind(this));
    robotSignalScene.action(/subscribe/, robotSignalSubscribe.bind(this));
    robotSignalScene.action(/changeVolume/, robotSignalSubscribe.bind(this));

    const searchRobotsScene = new Scene(cpz.TelegramScene.SEARCH_ROBOTS);
    searchRobotsScene.enter(searchRobotsEnter.bind(this));
    searchRobotsScene.leave(searchRobotsLeave.bind(this));
    searchRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      searchRobotsBack.bind(this)
    );
    searchRobotsScene.command("back", leave());
    searchRobotsScene.command("exit", leave());
    searchRobotsScene.action(/exchange/, searchRobotsSelectAsset.bind(this));
    searchRobotsScene.action(/asset/, searchRobotsSelectRobot.bind(this));
    searchRobotsScene.action(/robot/, searchRobotsOpenRobot.bind(this));
    searchRobotsScene.action(/back/, searchRobotsBack.bind(this));

    const searchSignalsScene = new Scene(cpz.TelegramScene.SEARCH_SIGNALS);
    searchSignalsScene.enter(searchSignalsEnter.bind(this));
    searchSignalsScene.leave(searchSignalsLeave.bind(this));
    searchSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      searchSignalsBack.bind(this)
    );
    searchSignalsScene.command("back", leave());
    searchSignalsScene.command("exit", leave());
    searchSignalsScene.action(/exchange/, searchSignalsSelectAsset.bind(this));
    searchSignalsScene.action(/asset/, searchSignalsSelectRobot.bind(this));
    searchSignalsScene.action(/robot/, searchSignalsOpenRobot.bind(this));
    searchSignalsScene.action(/back/, searchSignalsBack.bind(this));

    const settingsScene = new Scene(cpz.TelegramScene.SETTINGS);
    settingsScene.enter(settingsEnter.bind(this));
    settingsScene.leave(settingsLeave.bind(this));
    settingsScene.hears(match("keyboards.backKeyboard.back"), leave());
    settingsScene.command("back", leave());
    settingsScene.command("exit", leave());
    settingsScene.action(/userExAccs/, settingsUserExAccs.bind(this));

    const signalsScene = new Scene(cpz.TelegramScene.SIGNALS);
    signalsScene.enter(signalsEnter.bind(this));
    signalsScene.leave(signalsLeave.bind(this));
    signalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    signalsScene.command("back", leave());
    signalsScene.command("exit", leave());
    signalsScene.action(/mySignals/, signalsMySignals.bind(this));
    signalsScene.action(/searchSignals/, signalsSearchSignals.bind(this));
    signalsScene.action(/perfSignals/, signalsPerfSignals.bind(this));

    const startUserRobotScene = new Scene(cpz.TelegramScene.START_USER_ROBOT);
    startUserRobotScene.enter(startUserRobotEnter.bind(this));
    startUserRobotScene.leave(startUserRobotLeave.bind(this));
    startUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      startUserRobotBack.bind(this)
    );
    startUserRobotScene.command("back", leave());
    startUserRobotScene.command("exit", leave());
    startUserRobotScene.action(/yes/, startUserRobotYes.bind(this));
    startUserRobotScene.action(/no/, startUserRobotBack.bind(this));

    const stopUserRobotScene = new Scene(cpz.TelegramScene.STOP_USER_ROBOT);
    stopUserRobotScene.enter(stopUserRobotEnter.bind(this));
    stopUserRobotScene.leave(stopUserRobotLeave.bind(this));
    stopUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      stopUserRobotBack.bind(this)
    );
    stopUserRobotScene.command("back", leave());
    stopUserRobotScene.command("exit", leave());
    stopUserRobotScene.action(/yes/, stopUserRobotYes.bind(this));
    stopUserRobotScene.action(/no/, stopUserRobotBack.bind(this));

    const subscribeSignalsScene = new Scene(
      cpz.TelegramScene.SUBSCRIBE_SIGNALS
    );
    subscribeSignalsScene.enter(subscribeSignalsEnter.bind(this));
    subscribeSignalsScene.leave(subscribeSignalsLeave.bind(this));
    subscribeSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      subscribeSignalsBack.bind(this)
    );
    subscribeSignalsScene.command("back", leave());
    subscribeSignalsScene.command("exit", leave());
    subscribeSignalsScene.hears(/(.*?)/, subscribeSignalsConfirm.bind(this));

    const userExAccScene = new Scene(cpz.TelegramScene.USER_EXCHANGE_ACC);
    userExAccScene.enter(userExAccEnter.bind(this));
    userExAccScene.leave(userExAccLeave.bind(this));
    userExAccScene.hears(
      match("keyboards.backKeyboard.back"),
      userExAccBack.bind(this)
    );
    userExAccScene.command("back", leave());
    userExAccScene.command("exit", leave());
    userExAccScene.action(/edit/, userExAccEdit.bind(this));
    userExAccScene.action(/delete/, userExAccDelete.bind(this));
    userExAccScene.action(/back/, userExAccBack.bind(this));

    const userExAccsScene = new Scene(cpz.TelegramScene.USER_EXCHANGE_ACCS);
    userExAccsScene.enter(userExAccsEnter.bind(this));
    userExAccsScene.leave(userExAccsLeave.bind(this));
    userExAccsScene.hears(
      match("keyboards.backKeyboard.back"),
      userExAccsBack.bind(this)
    );
    userExAccsScene.command("back", leave());
    userExAccsScene.command("exit", leave());
    userExAccsScene.action(/addUserExAcc/, userExAccsAddAcc.bind(this));
    userExAccsScene.action(/userExAcc/, userExAccsSelectedAcc.bind(this));

    const userRobotScene = new Scene(cpz.TelegramScene.USER_ROBOT);
    userRobotScene.enter(userRobotInfo.bind(this));
    userRobotScene.leave(userRobotLeave.bind(this));
    userRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      userRobotBack.bind(this)
    );
    userRobotScene.command("back", leave());
    userRobotScene.command("exit", leave());
    userRobotScene.action(/info/, userRobotInfo.bind(this));
    userRobotScene.action(/pStat/, userRobotPublicStats.bind(this));
    userRobotScene.action(/myStat/, userRobotMyStats.bind(this));
    userRobotScene.action(/pos/, userRobotPositions.bind(this));
    userRobotScene.action(/edit/, userRobotEdit.bind(this));
    userRobotScene.action(/start/, userRobotStart.bind(this));
    userRobotScene.action(/stop/, userRobotStop.bind(this));
    userRobotScene.action(/add/, userRobotAdd.bind(this));
    userRobotScene.action(/delete/, userRobotDelete.bind(this));

    const stage = new Stage([
      addUserExAccScene,
      addUserRobotScene,
      deleteUserRobotScene,
      editUserExAccScene,
      editUserRobotScene,
      faqScene,
      myRobotsScene,
      mySignalsScene,
      perfSignalsScene,
      robotsScene,
      robotSignalScene,
      searchRobotsScene,
      searchSignalsScene,
      settingsScene,
      signalsScene,
      subscribeSignalsScene,
      userExAccScene,
      userExAccsScene,
      userRobotScene
    ]);

    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());
    this.bot.start(this.start.bind(this));
    this.bot.command("menu", this.mainMenu.bind(this));
    this.bot.command("exit", this.mainMenu.bind(this));
    // Main menu
    this.bot.hears(
      match("keyboards.mainKeyboard.signals"),
      enter(cpz.TelegramScene.SIGNALS)
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.robots"),
      enter(cpz.TelegramScene.ROBOTS)
    );
    this.bot.hears(
      match("keyboards.mainKeyboard.settings"),
      enter(cpz.TelegramScene.SETTINGS)
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
