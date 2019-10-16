import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import Telegraf, { Extra } from "telegraf";
import Stage from "telegraf/stage";
import Scene from "telegraf/scenes/base";
import TelegrafI18n, { match, reply } from "telegraf-i18n";
import Session from "telegraf-session-redis";
import path from "path";
import {
  getMainKeyboard,
  getBackKeyboard
} from "../../state/telegram/keyboard";
import {
  getAssetsMenu,
  getSignalsMenu,
  getSignalRobotMenu,
  getFAQMenu
} from "../../state/telegram/menu";
import dayjs from "../../lib/dayjs";
import { round, sortAsc } from "../../utils/helpers";
import Auth from "../../mixins/auth";

const { enter, leave } = Stage;

//TODO: Logging
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
      stopped: this.stoppedService,
      events: {
        [cpz.Event.SIGNAL_ALERT]: this.handleSignal,
        [cpz.Event.SIGNAL_TRADE]: this.handleSignal
      },
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
      }
    });
  }

  async handleSignal(ctx: Context) {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "dev" ||
      process.env.NODE_ENV === "development"
    ) {
      try {
        const signal = <cpz.SignalEvent>ctx.params;

        const { robotId, type, action } = signal;
        const { name } = await this.broker.call(
          `${cpz.Service.DB_ROBOTS}.get`,
          {
            id: robotId,
            fields: ["id", "name"]
          }
        );

        const subscriptions = await this.broker.call(
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
          let message = "";
          const robotInfo = this.i18n.t("en", `signal.${type}`, { name });
          const actionText = this.i18n.t("en", `tradeAction.${signal.action}`);
          const orderTypeText = this.i18n.t(
            "en",
            `orderType.${signal.orderType}`
          );

          if (type === cpz.SignalType.alert) {
            const signalText = this.i18n.t("en", "robot.signal", {
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
              tradeText = this.i18n.t("en", "robot.positionClosed", {
                code: signal.positionCode,
                entryAction: this.i18n.t(
                  "en",
                  `tradeAction.${position.entryAction}`
                ),
                entryOrderType: this.i18n.t(
                  "en",
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
              tradeText = this.i18n.t("en", "robot.positionOpen", {
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

          await Promise.all(
            subscriptions.map(
              async ({
                telegramId
              }: {
                telegramId: number;
                userId: string;
              }) => {
                try {
                  await this.bot.telegram.sendMessage(telegramId, message, {
                    parse_mode: "HTML"
                  });
                } catch (err) {
                  this.logger.error(err);
                  this.blockHandler(telegramId, err.response);
                }
              }
            )
          );
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  async broadcastMessage(ctx: Context) {
    try {
      const users = [];
      if (ctx.params.userId) {
        const { telegramId } = await this.broker.call(
          `${cpz.Service.DB_USERS}.get`,
          { id: ctx.params.userId }
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
        this.logger.info(userslist);
        userslist.forEach(({ telegramId }: cpz.User) => {
          users.push(telegramId);
        });
      }

      if (users.length > 0) {
        for (const id of users) {
          try {
            await this.bot.telegram.sendMessage(id, ctx.params.message, {
              parse_mode: "HTML"
            });
          } catch (err) {
            this.logger.error(err);
            this.blockHandler(id, err.response);
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  createdService() {
    const session = new Session({
      store: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS
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

    const signalsScene = new Scene("signals");
    signalsScene.enter(this.signalsEnter.bind(this));
    signalsScene.leave(this.signalsLeave.bind(this));
    signalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    signalsScene.command("back", leave());
    signalsScene.action(/asset/, this.signalsSelectedAsset.bind(this));
    signalsScene.action(/robot/, this.signalsSelectedRobot.bind(this));
    signalsScene.action(/unsubscribe/, this.signalsUnsubscribe.bind(this));
    signalsScene.action(/subscribe/, this.signalsSubscribe.bind(this));
    signalsScene.action(/info/, this.robotInfo.bind(this));
    signalsScene.action(/stats/, this.robotStats.bind(this));
    signalsScene.action(/pos/, this.robotPositions.bind(this));
    const mySignalsScene = new Scene("mySignals");
    mySignalsScene.enter(this.mySignalsEnter.bind(this));
    mySignalsScene.leave(this.signalsLeave.bind(this));
    mySignalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    mySignalsScene.command("back", leave());
    mySignalsScene.action(/robot/, this.signalsSelectedRobot.bind(this));
    mySignalsScene.action(/unsubscribe/, this.signalsUnsubscribe.bind(this));
    mySignalsScene.action(/subscribe/, this.signalsSubscribe.bind(this));
    mySignalsScene.action(/info/, this.robotInfo.bind(this));
    mySignalsScene.action(/stats/, this.robotStats.bind(this));
    mySignalsScene.action(/pos/, this.robotPositions.bind(this));
    const faqScene = new Scene("faq");
    faqScene.enter(this.faqEnter.bind(this));
    faqScene.leave(this.faqLeave.bind(this));
    faqScene.hears(match("keyboards.backKeyboard.back"), leave());
    faqScene.command("back", leave());
    faqScene.action(/q/, this.faqSelected.bind(this));
    const stage = new Stage([signalsScene, mySignalsScene, faqScene]);
    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());
    this.bot.start(this.start.bind(this));
    this.bot.hears(match("keyboards.mainKeyboard.signals"), enter("signals"));
    this.bot.hears(
      match("keyboards.mainKeyboard.mySignals"),
      enter("mySignals")
    );
    this.bot.hears(match("keyboards.mainKeyboard.faq"), enter("faq"));
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
      this.logger.warn("Bot in production mode!");
    } else if (
      process.env.NODE_ENV === "dev" ||
      process.env.NODE_ENV === "development"
    ) {
      await this.bot.telegram.deleteWebhook();
      await this.bot.startPolling();
      this.logger.warn("Bot in development mode!");
    } else {
      this.logger.warn("Bot not started!");
    }
  }

  async stoppedService() {
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
      const { mainKeyboard } = getMainKeyboard(ctx);
      return ctx.reply(
        ctx.i18n.t("welcome", {
          username: this.formatName(ctx)
        }),
        mainKeyboard
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
          //TODO: change subscription flag
          const { id } = user;
          const subscriptions = await this.broker.call(
            `${cpz.Service.DB_USER_SIGNALS}.find`,
            {
              fields: ["robotId"],
              query: {
                userId: id,
                telegram: true
              }
            }
          );
          for (const { robotId } of subscriptions) {
            await this.broker.call(
              `${cpz.Service.DB_USER_SIGNALS}.unsubscribe`,
              {
                robotId
              },
              {
                meta: {
                  user: { id }
                }
              }
            );
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async faq(ctx: any) {
    try {
      return ctx.reply(
        "<b>F</b>requently <b>A</b>sked <b>Q</b>uestions\n\n" +
          ctx.i18n.t("faq.signal1") +
          ctx.i18n.t("faq.signal2") +
          ctx.i18n.t("faq.signal3") +
          ctx.i18n.t("faq.signal4") +
          ctx.i18n.t("faq.signal5") +
          ctx.i18n.t("faq.robot1") +
          ctx.i18n.t("faq.robot2"),
        Extra.HTML()
      );
    } catch (e) {
      this.logger.error(e);
      return ctx.reply(ctx.i18n.t("failed"));
    }
  }

  async defaultHandler(ctx: any) {
    this.logger.info(ctx);
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("defaultHandler"), mainKeyboard);
  }

  /*****************************
   *  FAQ Stage
   *****************************/
  async faqEnter(ctx: any) {
    try {
      const { backKeyboard } = getBackKeyboard(ctx);
      await ctx.reply(ctx.i18n.t("keyboards.mainKeyboard.faq"), backKeyboard);

      return ctx.reply(ctx.i18n.t("scenes.faq.title"), getFAQMenu(ctx));
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async faqLeave(ctx: any) {
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("menu"), mainKeyboard);
  }

  async faqSelected(ctx: any) {
    try {
      const { p: selectedQ } = JSON.parse(ctx.callbackQuery.data);
      if (ctx.scene.state.q === selectedQ) return;
      ctx.scene.state.q = selectedQ;

      return ctx.editMessageText(
        `<b>${ctx.i18n.t(`scenes.faq.q.${selectedQ}`)}</b>\n\n${ctx.i18n.t(
          `scenes.faq.a.${selectedQ}`
        )}`,
        getFAQMenu(ctx)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  /*****************************
   *  Signals Stage
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
      await ctx.reply(
        ctx.i18n.t("keyboards.mainKeyboard.signals"),
        backKeyboard
      );
      if (!assets || !Array.isArray(assets) || assets.length < 0) {
        throw new Error("Failed to load signal assets");
      }
      return ctx.reply(
        ctx.i18n.t("scenes.signals.selectAsset"),
        getAssetsMenu(assets)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async signalsLeave(ctx: any) {
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("menu"), mainKeyboard);
  }

  async signalsSelectedAsset(ctx: any) {
    try {
      const { p: selectedAsset } = JSON.parse(ctx.callbackQuery.data);
      ctx.scene.state.selectedAsset = selectedAsset;
      const [asset, currency] = selectedAsset.split("/");
      const robots = await this.broker.call(`${cpz.Service.DB_ROBOTS}.find`, {
        fields: ["id", "name"],
        query: {
          available: { $gte: 20 },
          asset,
          currency
        }
      });
      if (!robots || !Array.isArray(robots) || robots.length === 0) {
        throw new Error("Failed to load signal robots");
      }
      return ctx.editMessageText(
        ctx.i18n.t("scenes.signals.selectRobot", { asset: selectedAsset }),
        getSignalsMenu(robots)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async signalsSelectedRobot(ctx: any) {
    try {
      const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
      const signalRobot = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobot`,
        {
          robotId
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      ctx.scene.state.selectedRobot = signalRobot;
      if (!signalRobot) throw new Error("Failed to load robot");
      return this.robotInfo(ctx);
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async signalsSubscribe(ctx: any) {
    try {
      const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
      await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.subscribe`,
        { robotId },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      const { signals } = ctx.scene.state.selectedRobot.robot;
      let signalsText = "";
      if (signals.length > 0) {
        signals.forEach(
          (signal: {
            code: string;
            action: cpz.TradeAction;
            orderType: cpz.OrderType;
            price: number;
            candleTimestamp: string;
          }) => {
            const actionText = ctx.i18n.t(`tradeAction.${signal.action}`);
            const orderTypeText = ctx.i18n.t(`orderType.${signal.orderType}`);
            const text = ctx.i18n.t("robot.signal", {
              code: signal.code,
              timestamp: dayjs
                .utc(signal.candleTimestamp)
                .format("YYYY-MM-DD HH:mm UTC"),
              action: actionText,
              orderType: orderTypeText,
              price: +signal.price
            });
            signalsText = `${signalsText}\n${text}`;
          }
        );
      }

      await ctx.editMessageText(
        ctx.i18n.t("scenes.signals.subscribedSignals", {
          name: ctx.scene.state.selectedRobot.robot.name
        }),
        Extra.HTML()
      );
      if (signalsText !== "") {
        signalsText = ctx.i18n.t("robot.currentSignals", {
          name: ctx.scene.state.selectedRobot.robot.name,
          signals: signalsText
        });
        await ctx.reply(signalsText, Extra.HTML());
      }
      await ctx.scene.leave();
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async signalsUnsubscribe(ctx: any) {
    try {
      const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
      await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.unsubscribe`,
        { robotId },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      await ctx.editMessageText(
        ctx.i18n.t("scenes.signals.unsubscribedSignals", {
          name: ctx.scene.state.selectedRobot.robot.name
        }),
        Extra.HTML()
      );
      await ctx.scene.leave();
    } catch (e) {
      this.logger.error(e);

      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  /*****************************
   *  My Signals Stage
   *****************************/

  async mySignalsEnter(ctx: any) {
    try {
      const robots = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobots`,
        null,
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      const { backKeyboard } = getBackKeyboard(ctx);
      await ctx.reply(
        ctx.i18n.t("keyboards.mainKeyboard.mySignals"),
        backKeyboard
      );
      if (!robots || !Array.isArray(robots) || robots.length === 0) {
        await ctx.reply(ctx.i18n.t("scenes.mySignals.robotsNone"));
        await ctx.scene.leave();
      } else {
        return ctx.reply(
          ctx.i18n.t("scenes.mySignals.robotsList"),
          getSignalsMenu(robots)
        );
      }
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  /*****************************
   *  Robot View
   *****************************/

  async robotInfo(ctx: any) {
    try {
      if (ctx.scene.state.page === "info") return;
      ctx.scene.state.page = "info";
      const { robot, subscription } = ctx.scene.state.selectedRobot;
      const { signals } = robot;
      let signalsText = "";
      if (signals.length > 0) {
        signals.forEach(
          (signal: {
            code: string;
            action: cpz.TradeAction;
            orderType: cpz.OrderType;
            price: number;
            candleTimestamp: string;
          }) => {
            const actionText = ctx.i18n.t(`tradeAction.${signal.action}`);
            const orderTypeText = ctx.i18n.t(`orderType.${signal.orderType}`);
            const text = ctx.i18n.t("robot.signal", {
              code: signal.code,
              timestamp: dayjs
                .utc(signal.candleTimestamp)
                .format("YYYY-MM-DD HH:mm UTC"),
              action: actionText,
              orderType: orderTypeText,
              price: +signal.price
            });
            signalsText = `${signalsText}\n${text}`;
          }
        );
      }
      if (signalsText !== "")
        signalsText = ctx.i18n.t("robot.signals", { signals: signalsText });
      const message = `${ctx.i18n.t("robot.info", {
        ...robot,
        signalsCount: round(1440 / robot.timeframe)
      })}${signalsText}`;
      return ctx.editMessageText(
        message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async robotStats(ctx: any) {
    try {
      if (ctx.scene.state.page === "stats") return;
      ctx.scene.state.page = "stats";
      const { robot, subscription } = ctx.scene.state.selectedRobot;
      const { statistics } = robot;
      let message;
      if (statistics && Object.keys(statistics).length > 0)
        message = `${ctx.i18n.t("robot.statsProfit", statistics)}${ctx.i18n.t(
          "robot.statsWinners",
          statistics
        )}${ctx.i18n.t("robot.statsLosses", statistics)}`;
      else message = ctx.i18n.t("robot.statsNone");
      return ctx.editMessageText(
        ctx.i18n.t("robot.name", { name: robot.name }) + message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }

  async robotPositions(ctx: any) {
    try {
      if (ctx.scene.state.page === "pos") return;
      ctx.scene.state.page = "pos";
      const { robot, subscription } = ctx.scene.state.selectedRobot;
      const { openPositions, closedPositions } = robot;
      let openPositionsText = "";
      if (
        openPositions &&
        Array.isArray(openPositions) &&
        openPositions.length > 0
      ) {
        openPositions.forEach((pos: cpz.RobotPositionState) => {
          const posText = ctx.i18n.t("robot.positionOpen", {
            ...pos,
            entryAction: ctx.i18n.t(`tradeAction.${pos.entryAction}`),
            entryOrderType: ctx.i18n.t(`orderType.${pos.entryOrderType}`),
            entryDate: dayjs.utc(pos.entryDate).format("YYYY-MM-DD HH:mm UTC")
          });
          let signalsText = "";
          if (pos.alerts && Object.keys(pos.alerts).length > 0) {
            Object.values(pos.alerts).forEach(signal => {
              const actionText = ctx.i18n.t(`tradeAction.${signal.action}`);
              const orderTypeText = ctx.i18n.t(`orderType.${signal.orderType}`);
              const text = ctx.i18n.t("robot.signal", {
                code: pos.code,
                timestamp: dayjs
                  .utc(signal.candleTimestamp)
                  .format("YYYY-MM-DD HH:mm UTC"),
                action: actionText,
                orderType: orderTypeText,
                price: +signal.price
              });
              signalsText = `${signalsText}\n${text}`;
            });
            signalsText = ctx.i18n.t("robot.positionSignals", {
              signals: signalsText
            });
          }
          openPositionsText = `${openPositionsText}\n\n${posText}\n${signalsText}`;
        });
        openPositionsText = ctx.i18n.t("robot.positionsOpen", {
          openPositions: openPositionsText
        });
      }

      let closedPositionsText = "";
      if (
        closedPositions &&
        Array.isArray(closedPositions) &&
        closedPositions.length > 0
      ) {
        closedPositions
          .sort((a, b) =>
            sortAsc(
              dayjs.utc(a.entryDate).valueOf(),
              dayjs.utc(b.entryDate).valueOf()
            )
          )
          .forEach((pos: cpz.RobotPositionState) => {
            const posText = ctx.i18n.t("robot.positionClosed", {
              ...pos,
              entryDate: dayjs
                .utc(pos.entryDate)
                .format("YYYY-MM-DD HH:mm UTC"),
              exitDate: dayjs.utc(pos.exitDate).format("YYYY-MM-DD HH:mm UTC"),
              entryAction: ctx.i18n.t(`tradeAction.${pos.entryAction}`),
              entryOrderType: ctx.i18n.t(`orderType.${pos.entryOrderType}`),
              exitAction: ctx.i18n.t(`tradeAction.${pos.exitAction}`),
              exitOrderType: ctx.i18n.t(`orderType.${pos.exitOrderType}`)
            });
            closedPositionsText = `${closedPositionsText}\n\n${posText}`;
          });
        closedPositionsText = ctx.i18n.t("robot.positionsClosed", {
          closedPositions: closedPositionsText
        });
      }

      const message =
        openPositionsText !== "" || closedPositionsText !== ""
          ? `${closedPositionsText}${openPositionsText}`
          : ctx.i18n.t("robot.positionsNone");
      return ctx.editMessageText(
        ctx.i18n.t("robot.name", { name: robot.name }) + message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      await ctx.scene.leave();
    }
  }
}

export = BotService;
