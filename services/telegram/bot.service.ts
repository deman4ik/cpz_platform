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
import TelegrafI18n, { match, reply } from "telegraf-i18n";
import Session from "telegraf-session-redis";
import path from "path";
import {
  getMainKeyboard,
  getBackKeyboard
} from "../../state/telegram/keyboard";
import { Op } from "sequelize";
import {
  getAssetsMenu,
  getSignalsMenu,
  getSignalRobotMenu
} from "../../state/telegram/menu";
import dayjs from "../../lib/dayjs";

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
      }
    });
  }

  async handleSignal(ctx: Context) {
    try {
      const signal = <cpz.SignalEvent>ctx.params;

      const { robotId, type } = signal;
      const { name } = await this.broker.call(`${cpz.Service.DB_ROBOTS}.get`, {
        id: robotId,
        fields: ["id", "name"]
      });

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
        const robotInfo = this.i18n.t("en", `signal.${type}`, { name });
        const actionText = this.i18n.t("en", `tradeAction.${signal.action}`);
        const orderTypeText = this.i18n.t(
          "en",
          `orderType.${signal.orderType}`
        );
        const signalText = this.i18n.t("en", "robot.signal", {
          code: signal.positionCode,
          timestamp: dayjs
            .utc(signal.candleTimestamp)
            .format("YYYY-MM-DD HH:mm UTC"),
          action: actionText,
          orderType: orderTypeText,
          price: +signal.price
        });

        const message = `${robotInfo}${signalText}`;
        await Promise.all(
          subscriptions.map(
            async ({ telegramId }: { telegramId: string; userId: string }) => {
              await this.bot.telegram.sendMessage(telegramId, message, {
                parse_mode: "HTML"
              });
            }
          )
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
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

    const stage = new Stage([signalsScene, mySignalsScene]);
    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());

    this.bot.start(this.start.bind(this));
    this.bot.hears(match("keyboards.mainKeyboard.signals"), enter("signals"));
    this.bot.hears(
      match("keyboards.mainKeyboard.mySignals"),
      enter("mySignals")
    );
    this.bot.hears(match("keyboards.mainKeyboard.faq"), this.faq);
    this.bot.hears(
      match("keyboards.mainKeyboard.contact"),
      reply("contact", Extra.HTML())
    );
    this.bot.hears(/(.*?)/, this.defaultHandler.bind(this));
  }

  /*****************************
   *  Service hooks
   *****************************/

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
    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t("defaultHandler"), mainKeyboard);
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
      ctx.scene.leave();
      return ctx.reply(ctx.i18n.t("failed"));
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
          available: { [Op.gte]: 20 },
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
      ctx.scene.leave();
      return ctx.reply(ctx.i18n.t("failed"));
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
      ctx.scene.leave();
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

      await ctx.editMessageText(
        ctx.i18n.t("scenes.signals.subscribedSignals", {
          name: ctx.scene.state.selectedRobot.robot.name
        })
      );
      ctx.scene.leave();
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      ctx.scene.leave();
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
        })
      );
      ctx.scene.leave();
    } catch (e) {
      this.logger.error(e);

      await ctx.reply(ctx.i18n.t("failed"));
      ctx.scene.leave();
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
      if (!robots || !Array.isArray(robots) || robots.length === 0) {
        throw new Error("Failed to load signal robots");
      }
      return ctx.reply(
        ctx.i18n.t("scenes.mySignals.robotsList"),
        getSignalsMenu(robots)
      );
    } catch (e) {
      this.logger.error(e);
      ctx.scene.leave();
      return ctx.reply(ctx.i18n.t("failed"));
    }
  }

  /*****************************
   *  Robot View
   *****************************/

  async robotInfo(ctx: any) {
    try {
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
            signalsText = `${signalsText}\n\n${text}`;
          }
        );
      } else signalsText = ctx.i18n.t("robot.signalsNone");
      signalsText = ctx.i18n.t("robot.signals", { signals: signalsText });
      const message = `${ctx.i18n.t("robot.info", robot)}${signalsText}`;
      return ctx.editMessageText(
        message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      ctx.scene.leave();
    }
  }

  async robotStats(ctx: any) {
    try {
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
        message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      ctx.scene.leave();
    }
  }

  async robotPositions(ctx: any) {
    try {
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
              signalsText = `${signalsText}\n\n${text}`;
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
        closedPositions.forEach((pos: cpz.RobotPositionState) => {
          const posText = ctx.i18n.t("robot.positionClosed", {
            ...pos,
            entryDate: dayjs.utc(pos.entryDate).format("YYYY-MM-DD HH:mm UTC"),
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
        openPositionsText !== "" && closedPositionsText !== ""
          ? `${openPositionsText}${closedPositionsText}`
          : ctx.i18n.t("robot.positionsNone");
      return ctx.editMessageText(
        message,
        getSignalRobotMenu(ctx, robot.id, subscription.telegram)
      );
    } catch (e) {
      this.logger.error(e);
      await ctx.reply(ctx.i18n.t("failed"));
      ctx.scene.leave();
    }
  }
}

export = BotService;
