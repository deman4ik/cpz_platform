import { Service, ServiceBroker, Context } from "moleculer";
import { cpz } from "../../@types";
import Telegraf, { Extra } from "telegraf";
import Stage from "telegraf/stage";
const { enter, leave } = Stage;
import Scene from "telegraf/scenes/base";
import TelegrafI18n, { match, reply } from "telegraf-i18n";
import Session from "telegraf-session-redis";
import path from "path";
import {
  getMainKeyboard,
  getBackKeyboard
} from "../../state/telegram/keyboard";

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
  myRobotsEnter,
  myRobotsNextPage,
  myRobotsPrevPage,
  myRobotsSelectedRobot,
  myRobotsAdd,
  myRobotsBack,
  myRobotsBackEdit,
  myRobotsLeave,
  mySignalsEnter,
  mySingalsNextPage,
  mySingalsPrevPage,
  mySignalsSelectedRobot,
  mySignalsAdd,
  mySignalsBack,
  mySignalsBackEdit,
  mySignalsLeave,
  perfSignalsEnter,
  perfSignalsBack,
  perfSignalsBackEdit,
  perfSignalsLeave,
  perfRobotsEnter,
  perfRobotsBack,
  perfRobotsBackEdit,
  perfRobotsLeave,
  robotsEnter,
  robotsMyRobots,
  robotsSearchRobots,
  robotsTopRobots,
  robotsPerfRobots,
  robotsLeave,
  robotSignalInfo,
  robotSignalPublicStats,
  robotSignalMyStats,
  robotSignalPositions,
  robotSignalSubscribe,
  robotSignalUnsubscribe,
  robotSignalBack,
  robotSignalBackEdit,
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
  settingsTurnTelegramSignalsNotifOn,
  settingsTurnTelegramSignalsNotifOff,
  settingsTurnTelegramTradingNotifOn,
  settingsTurnTelegramTradingNotifOff,
  settingsLeave,
  signalsEnter,
  signalsMySignals,
  signalsSearchSignals,
  signalsTopSignals,
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
  supportEnter,
  supportMessage,
  supportLeave,
  topSignalsEnter,
  topSignalsSelectRobot,
  topSignalsOpenRobot,
  topSignalsBack,
  topSignalsBackEdit,
  topSignalsLeave,
  topRobotsEnter,
  topRobotsSelectRobot,
  topRobotsOpenRobot,
  topRobotsBack,
  topRobotsBackEdit,
  topRobotsLeave,
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
  userRobotLeave,
  searchRobotsBackEdit,
  userExAccsBackEdit,
  userRobotBackEdit,
  searchSignalsBackEdit,
  userExAccBackEdit
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
            telegramId: "number",
            message: "string"
          },
          handler: this.sendMessage
        }
      }
    });
  }

  async sendMessage(ctx: Context<cpz.TelegramMessage>) {
    const { telegramId, message } = ctx.params;
    try {
      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: "HTML"
      });
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      return this.blockHandler(telegramId, err.response);
    }
  }

  createdService() {
    const session = new Session({
      store: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS && {}
      },
      ttl: 60 * 30,
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
    addUserExAccScene.hears(match("keyboards.backKeyboard.menu"), leave());
    addUserExAccScene.command("back", addUserExAccBack.bind(this));
    addUserExAccScene.command("menu", leave());
    addUserExAccScene.action(
      /exchange/,
      addUserExAccSelectedExchange.bind(this)
    );
    addUserExAccScene.action(/back/, addUserExAccBack.bind(this));
    addUserExAccScene.hears(/(.*?)/, addUserExAccSubmited.bind(this));

    const addUserRobotScene = new Scene(cpz.TelegramScene.ADD_USER_ROBOT);
    addUserRobotScene.enter(addUserRobotEnter.bind(this));
    addUserRobotScene.leave(addUserRobotLeave.bind(this));
    addUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      addUserRobotBack.bind(this)
    );
    addUserRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    addUserRobotScene.command("back", addUserRobotBack.bind(this));
    addUserRobotScene.command("menu", leave());
    addUserRobotScene.action(/userExAcc/, addUserRobotSelectedAcc.bind(this));
    addUserRobotScene.action(/back/, addUserRobotBack.bind(this));
    addUserRobotScene.hears(/(.*?)/, addUserRobotConfirm.bind(this));

    const deleteUserRobotScene = new Scene(cpz.TelegramScene.DELETE_USER_ROBOT);
    deleteUserRobotScene.enter(deleteUserRobotEnter.bind(this));
    deleteUserRobotScene.leave(deleteUserRobotLeave.bind(this));
    deleteUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      deleteUserRobotBack.bind(this)
    );
    deleteUserRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    deleteUserRobotScene.command("back", deleteUserRobotBack.bind(this));
    deleteUserRobotScene.command("menu", leave());
    deleteUserRobotScene.action(/yes/, deleteUserRobotYes.bind(this));
    deleteUserRobotScene.action(/no/, deleteUserRobotBack.bind(this));

    const editUserExAccScene = new Scene(cpz.TelegramScene.EDIT_USER_EX_ACC);
    editUserExAccScene.enter(editUserExAccEnter.bind(this));
    editUserExAccScene.leave(editUserExAccLeave.bind(this));
    editUserExAccScene.hears(
      match("keyboards.backKeyboard.back"),
      editUserExAccBack.bind(this)
    );
    editUserExAccScene.hears(match("keyboards.backKeyboard.menu"), leave());
    editUserExAccScene.command("back", editUserExAccBack.bind(this));
    editUserExAccScene.command("menu", leave());
    editUserExAccScene.hears(/(.*?)/, editUserExAccSubmited.bind(this));

    const editUserRobotScene = new Scene(cpz.TelegramScene.EDIT_USER_ROBOT);
    editUserRobotScene.enter(editUserRobotEnter.bind(this));
    editUserRobotScene.leave(editUserRobotLeave.bind(this));
    editUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      editUserRobotBack.bind(this)
    );
    editUserRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    editUserRobotScene.command("back", editUserRobotBack.bind(this));
    editUserRobotScene.command("menu", leave());
    editUserRobotScene.hears(/(.*?)/, editUserRobotConfirm.bind(this));

    const myRobotsScene = new Scene(cpz.TelegramScene.MY_ROBOTS);
    myRobotsScene.enter(myRobotsEnter.bind(this));
    myRobotsScene.leave(myRobotsLeave.bind(this));
    myRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      myRobotsBack.bind(this)
    );
    myRobotsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    myRobotsScene.command("back", myRobotsBack.bind(this));
    myRobotsScene.command("menu", leave());
    myRobotsScene.action(/robot/, myRobotsSelectedRobot.bind(this));
    myRobotsScene.action(/add/, myRobotsAdd.bind(this));
    myRobotsScene.action(/next/, myRobotsNextPage.bind(this));
    myRobotsScene.action(/prev/, myRobotsPrevPage.bind(this));
    myRobotsScene.action(/back/, myRobotsBackEdit.bind(this));

    const mySignalsScene = new Scene(cpz.TelegramScene.MY_SIGNALS);
    mySignalsScene.enter(mySignalsEnter.bind(this));
    mySignalsScene.leave(mySignalsLeave.bind(this));
    mySignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      mySignalsBack.bind(this)
    );
    mySignalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    mySignalsScene.command("back", mySignalsBack.bind(this));
    mySignalsScene.command("menu", leave());
    mySignalsScene.action(/robot/, mySignalsSelectedRobot.bind(this));
    mySignalsScene.action(/add/, mySignalsAdd.bind(this));
    mySignalsScene.action(/next/, mySingalsNextPage.bind(this));
    mySignalsScene.action(/prev/, mySingalsPrevPage.bind(this));
    mySignalsScene.action(/back/, mySignalsBackEdit.bind(this));

    const perfRobotsScene = new Scene(cpz.TelegramScene.PERFORMANCE_ROBOTS);
    perfRobotsScene.enter(perfRobotsEnter.bind(this));
    perfRobotsScene.leave(perfRobotsLeave.bind(this));
    perfRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      perfRobotsBack.bind(this)
    );
    perfRobotsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    perfRobotsScene.command("back", perfRobotsBack.bind(this));
    perfRobotsScene.command("menu", leave());
    perfRobotsScene.action(/back/, perfRobotsBackEdit.bind(this));

    const perfSignalsScene = new Scene(cpz.TelegramScene.PERFORMANCE_SIGNALS);
    perfSignalsScene.enter(perfSignalsEnter.bind(this));
    perfSignalsScene.leave(perfSignalsLeave.bind(this));
    perfSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      perfSignalsBack.bind(this)
    );
    perfSignalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    perfSignalsScene.command("back", perfSignalsBack.bind(this));
    perfSignalsScene.command("menu", leave());
    perfSignalsScene.action(/back/, perfSignalsBackEdit.bind(this));

    const robotsScene = new Scene(cpz.TelegramScene.ROBOTS);
    robotsScene.enter(robotsEnter.bind(this));
    robotsScene.leave(robotsLeave.bind(this));
    robotsScene.hears(match("keyboards.backKeyboard.back"), leave());
    robotsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    robotsScene.command("back", leave());
    robotsScene.command("menu", leave());
    robotsScene.action(/myRobots/, robotsMyRobots.bind(this));
    robotsScene.action(/searchRobots/, robotsSearchRobots.bind(this));
    robotsScene.action(/topRobots/, robotsTopRobots.bind(this));
    robotsScene.action(/perfRobots/, robotsPerfRobots.bind(this));
    robotsScene.action(/back/, leave());

    const robotSignalScene = new Scene(cpz.TelegramScene.ROBOT_SIGNAL);
    robotSignalScene.enter(robotSignalInfo.bind(this));
    robotSignalScene.leave(robotSignalLeave.bind(this));
    robotSignalScene.hears(
      match("keyboards.backKeyboard.back"),
      robotSignalBack.bind(this)
    );
    robotSignalScene.hears(match("keyboards.backKeyboard.menu"), leave());
    robotSignalScene.command("back", robotSignalBack.bind(this));
    robotSignalScene.command("menu", leave());
    robotSignalScene.action(/info/, robotSignalInfo.bind(this));
    robotSignalScene.action(/pStat/, robotSignalPublicStats.bind(this));
    robotSignalScene.action(/myStat/, robotSignalMyStats.bind(this));
    robotSignalScene.action(/pos/, robotSignalPositions.bind(this));
    robotSignalScene.action(/unsubscribe/, robotSignalUnsubscribe.bind(this));
    robotSignalScene.action(/subscribe/, robotSignalSubscribe.bind(this));
    robotSignalScene.action(/changeVolume/, robotSignalSubscribe.bind(this));
    robotSignalScene.action(/back/, robotSignalBackEdit.bind(this));

    const searchRobotsScene = new Scene(cpz.TelegramScene.SEARCH_ROBOTS);
    searchRobotsScene.enter(searchRobotsEnter.bind(this));
    searchRobotsScene.leave(searchRobotsLeave.bind(this));
    searchRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      searchRobotsBack.bind(this)
    );
    searchRobotsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    searchRobotsScene.command("back", searchRobotsBack.bind(this));
    searchRobotsScene.command("menu", leave());
    searchRobotsScene.action(/exchange/, searchRobotsSelectAsset.bind(this));
    searchRobotsScene.action(/asset/, searchRobotsSelectRobot.bind(this));
    searchRobotsScene.action(/robot/, searchRobotsOpenRobot.bind(this));
    searchRobotsScene.action(/back/, searchRobotsBackEdit.bind(this));

    const searchSignalsScene = new Scene(cpz.TelegramScene.SEARCH_SIGNALS);
    searchSignalsScene.enter(searchSignalsEnter.bind(this));
    searchSignalsScene.leave(searchSignalsLeave.bind(this));
    searchSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      searchSignalsBack.bind(this)
    );
    searchSignalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    searchSignalsScene.command("back", searchSignalsBack.bind(this));
    searchSignalsScene.command("menu", leave());
    searchSignalsScene.action(/exchange/, searchSignalsSelectAsset.bind(this));
    searchSignalsScene.action(/asset/, searchSignalsSelectRobot.bind(this));
    searchSignalsScene.action(/robot/, searchSignalsOpenRobot.bind(this));
    searchSignalsScene.action(/back/, searchSignalsBackEdit.bind(this));

    const settingsScene = new Scene(cpz.TelegramScene.SETTINGS);
    settingsScene.enter(settingsEnter.bind(this));
    settingsScene.leave(settingsLeave.bind(this));
    settingsScene.hears(match("keyboards.backKeyboard.back"), leave());
    settingsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    settingsScene.command("back", leave());
    settingsScene.command("menu", leave());
    settingsScene.action(/userExAccs/, settingsUserExAccs.bind(this));
    settingsScene.action(
      /turnTelegramSignalsNotifOn/,
      settingsTurnTelegramSignalsNotifOn.bind(this)
    );
    settingsScene.action(
      /turnTelegramSignalsNotifOff/,
      settingsTurnTelegramSignalsNotifOff.bind(this)
    );
    settingsScene.action(
      /turnTelegramTradingNotifOn/,
      settingsTurnTelegramTradingNotifOn.bind(this)
    );
    settingsScene.action(
      /turnTelegramTradingNotifOff/,
      settingsTurnTelegramTradingNotifOff.bind(this)
    );
    settingsScene.action(/back/, leave());

    const signalsScene = new Scene(cpz.TelegramScene.SIGNALS);
    signalsScene.enter(signalsEnter.bind(this));
    signalsScene.leave(signalsLeave.bind(this));
    signalsScene.hears(match("keyboards.backKeyboard.back"), leave());
    signalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    signalsScene.command("back", leave());
    signalsScene.command("menu", leave());
    signalsScene.action(/mySignals/, signalsMySignals.bind(this));
    signalsScene.action(/searchSignals/, signalsSearchSignals.bind(this));
    signalsScene.action(/topSignals/, signalsTopSignals.bind(this));
    signalsScene.action(/perfSignals/, signalsPerfSignals.bind(this));
    signalsScene.action(/back/, leave());

    const startUserRobotScene = new Scene(cpz.TelegramScene.START_USER_ROBOT);
    startUserRobotScene.enter(startUserRobotEnter.bind(this));
    startUserRobotScene.leave(startUserRobotLeave.bind(this));
    startUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      startUserRobotBack.bind(this)
    );
    startUserRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    startUserRobotScene.command("back", startUserRobotBack.bind(this));
    startUserRobotScene.command("menu", leave());
    startUserRobotScene.action(/yes/, startUserRobotYes.bind(this));
    startUserRobotScene.action(/no/, startUserRobotBack.bind(this));

    const stopUserRobotScene = new Scene(cpz.TelegramScene.STOP_USER_ROBOT);
    stopUserRobotScene.enter(stopUserRobotEnter.bind(this));
    stopUserRobotScene.leave(stopUserRobotLeave.bind(this));
    stopUserRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      stopUserRobotBack.bind(this)
    );
    stopUserRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    stopUserRobotScene.command("back", stopUserRobotBack.bind(this));
    stopUserRobotScene.command("menu", leave());
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
    subscribeSignalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    subscribeSignalsScene.command("back", subscribeSignalsBack.bind(this));
    subscribeSignalsScene.command("menu", leave());
    subscribeSignalsScene.hears(/(.*?)/, subscribeSignalsConfirm.bind(this));

    const supportScene = new Scene(cpz.TelegramScene.SUPPORT);
    supportScene.enter(supportEnter.bind(this));
    supportScene.leave(supportLeave.bind(this));
    supportScene.hears(match("keyboards.backKeyboard.back"), leave());
    supportScene.hears(match("keyboards.backKeyboard.menu"), leave());
    supportScene.command("back", leave());
    supportScene.command("menu", leave());
    supportScene.hears(/(.*?)/, supportMessage.bind(this));

    const topRobotsScene = new Scene(cpz.TelegramScene.TOP_ROBOTS);
    topRobotsScene.enter(topRobotsEnter.bind(this));
    topRobotsScene.leave(topRobotsLeave.bind(this));
    topRobotsScene.hears(
      match("keyboards.backKeyboard.back"),
      topRobotsBack.bind(this)
    );
    topRobotsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    topRobotsScene.command("back", topRobotsBack.bind(this));
    topRobotsScene.command("menu", leave());
    topRobotsScene.action(/exchange/, topRobotsSelectRobot.bind(this));
    topRobotsScene.action(/robot/, topRobotsOpenRobot.bind(this));
    topRobotsScene.action(/back/, topRobotsBackEdit.bind(this));

    const topSignalsScene = new Scene(cpz.TelegramScene.TOP_SIGNALS);
    topSignalsScene.enter(topSignalsEnter.bind(this));
    topSignalsScene.leave(topSignalsLeave.bind(this));
    topSignalsScene.hears(
      match("keyboards.backKeyboard.back"),
      topSignalsBack.bind(this)
    );
    topSignalsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    topSignalsScene.command("back", topSignalsBack.bind(this));
    topSignalsScene.command("menu", leave());
    topSignalsScene.action(/exchange/, topSignalsSelectRobot.bind(this));
    topSignalsScene.action(/robot/, topSignalsOpenRobot.bind(this));
    topSignalsScene.action(/back/, topSignalsBackEdit.bind(this));

    const userExAccScene = new Scene(cpz.TelegramScene.USER_EXCHANGE_ACC);
    userExAccScene.enter(userExAccEnter.bind(this));
    userExAccScene.leave(userExAccLeave.bind(this));
    userExAccScene.hears(
      match("keyboards.backKeyboard.back"),
      userExAccBack.bind(this)
    );
    userExAccScene.hears(match("keyboards.backKeyboard.menu"), leave());
    userExAccScene.command("back", userExAccBack.bind(this));
    userExAccScene.command("menu", leave());
    userExAccScene.action(/edit/, userExAccEdit.bind(this));
    userExAccScene.action(/delete/, userExAccDelete.bind(this));
    userExAccScene.action(/back/, userExAccBackEdit.bind(this));

    const userExAccsScene = new Scene(cpz.TelegramScene.USER_EXCHANGE_ACCS);
    userExAccsScene.enter(userExAccsEnter.bind(this));
    userExAccsScene.leave(userExAccsLeave.bind(this));
    userExAccsScene.hears(
      match("keyboards.backKeyboard.back"),
      userExAccsBack.bind(this)
    );
    userExAccsScene.hears(match("keyboards.backKeyboard.menu"), leave());
    userExAccsScene.command("back", userExAccsBack.bind(this));
    userExAccsScene.command("menu", leave());
    userExAccsScene.action(/addUserExAcc/, userExAccsAddAcc.bind(this));
    userExAccsScene.action(/userExAcc/, userExAccsSelectedAcc.bind(this));
    userExAccsScene.action(/back/, userExAccsBackEdit.bind(this));

    const userRobotScene = new Scene(cpz.TelegramScene.USER_ROBOT);
    userRobotScene.enter(userRobotInfo.bind(this));
    userRobotScene.leave(userRobotLeave.bind(this));
    userRobotScene.hears(
      match("keyboards.backKeyboard.back"),
      userRobotBack.bind(this)
    );
    userRobotScene.hears(match("keyboards.backKeyboard.menu"), leave());
    userRobotScene.command("back", userRobotBack.bind(this));
    userRobotScene.command("menu", leave());
    userRobotScene.action(/info/, userRobotInfo.bind(this));
    userRobotScene.action(/pStat/, userRobotPublicStats.bind(this));
    userRobotScene.action(/myStat/, userRobotMyStats.bind(this));
    userRobotScene.action(/pos/, userRobotPositions.bind(this));
    userRobotScene.action(/edit/, userRobotEdit.bind(this));
    userRobotScene.action(/start/, userRobotStart.bind(this));
    userRobotScene.action(/stop/, userRobotStop.bind(this));
    userRobotScene.action(/add/, userRobotAdd.bind(this));
    userRobotScene.action(/delete/, userRobotDelete.bind(this));
    userRobotScene.action(/back/, userRobotBackEdit.bind(this));

    const stage = new Stage([
      addUserExAccScene,
      addUserRobotScene,
      deleteUserRobotScene,
      editUserExAccScene,
      editUserRobotScene,
      myRobotsScene,
      mySignalsScene,
      perfSignalsScene,
      perfRobotsScene,
      robotsScene,
      robotSignalScene,
      searchRobotsScene,
      searchSignalsScene,
      settingsScene,
      signalsScene,
      startUserRobotScene,
      stopUserRobotScene,
      subscribeSignalsScene,
      supportScene,
      topRobotsScene,
      topSignalsScene,
      userExAccScene,
      userExAccsScene,
      userRobotScene
    ]);

    this.bot.use(this.auth.bind(this));
    this.bot.use(stage.middleware());
    this.bot.start(this.start.bind(this));
    this.bot.command("menu", this.mainMenu.bind(this));
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
      match("keyboards.mainKeyboard.support"),
      enter(cpz.TelegramScene.SUPPORT)
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
    try {
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
    } catch (e) {
      this.logger.error(e);
      throw e;
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
    let name = "";
    if (ctx.from.first_name || ctx.from.last_name)
      name = `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim();
    else if (ctx.from.username) name = ctx.from.username;
    return name;
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
        if (
          scene &&
          robotId &&
          (scene === cpz.TelegramScene.ROBOT_SIGNAL ||
            scene === cpz.TelegramScene.USER_ROBOT)
        ) {
          ctx.scene.state.silent = true;
          await ctx.scene.leave();
          await ctx.reply(
            ctx.i18n.t("welcome", {
              username: this.formatName(ctx)
            }),
            getBackKeyboard(ctx)
          );
          return ctx.scene.enter(scene, { robotId });
        }
      }
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
      if (error && error.ok === false && error.error_code === 403) {
        const [user] = await this.broker.call(`${cpz.Service.DB_USERS}.find`, {
          query: { telegramId }
        });

        if (user) {
          await this.broker.call(
            `${cpz.Service.DB_USERS}.setNotificationSettings`,
            {
              signalsTelegram: false,
              tradingTelegram: false
            },
            {
              meta: { user }
            }
          );

          //TODO: set sentTelegram in notifications to false
        }
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      this.logger.error(e);
      return { success: false, error: e.message };
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
