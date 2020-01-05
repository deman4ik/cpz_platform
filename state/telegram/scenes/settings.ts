import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";

function getSettingsMenu(ctx: any) {
  const {
    email,
    settings: {
      notifications: {
        signals: { telegram: notifSignalsTelegram },
        trading: { telegram: notifTradingTelegram }
      }
    }
  }: cpz.User = ctx.session.user;

  return Extra.HTML().markup((m: any) => {
    /*  const emailButton = email
      ? [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.changeEmail"),
            JSON.stringify({ a: "changeEmail" }),
            false
          )
        ]
      : [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.setEmail"),
            JSON.stringify({ a: "setEmail" }),
            false
          )
        ]; */
    const notifSignalsTelegramButton = notifSignalsTelegram
      ? [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.turnTelegramSignalsNotifOff"),
            JSON.stringify({ a: "turnTelegramSignalsNotifOff" }),
            false
          )
        ]
      : [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.turnTelegramSignalsNotifOn"),
            JSON.stringify({ a: "turnTelegramSignalsNotifOn" }),
            false
          )
        ];
    const notifTradingTelegramButton = notifTradingTelegram
      ? [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.turnTelegramTradingNotifOff"),
            JSON.stringify({ a: "turnTelegramTradingNotifOff" }),
            false
          )
        ]
      : [
          m.callbackButton(
            ctx.i18n.t("scenes.settings.turnTelegramTradingNotifOn"),
            JSON.stringify({ a: "turnTelegramTradingNotifOn" }),
            false
          )
        ];
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.settings.userExAccs"),
          JSON.stringify({ a: "userExAccs" }),
          false
        )
      ]
      //emailButton,
      //notifSignalsTelegramButton,
      //notifTradingTelegramButton
    ];

    return m.inlineKeyboard(buttons);
  });
}

async function settingsEnter(ctx: any) {
  try {
    if (ctx.scene.state.reload)
      ctx.session.user = await this.broket.call(`${cpz.Service.DB_USERS}.get`, {
        id: ctx.session.user.id
      });

    const { email }: cpz.User = ctx.session.user;
    this.logger.info(ctx.session.user);
    if (ctx.scene.state.reply === false) {
      await ctx.editMessageText(
        ctx.i18n.t("scenes.settings.info", {
          email: email || ctx.i18n.t("scenes.settings.emailNotSet")
        }),
        getSettingsMenu(ctx)
      );
    } else {
      await ctx.reply(
        ctx.i18n.t("keyboards.mainKeyboard.settings"),
        getBackKeyboard(ctx)
      );
      await ctx.reply(
        ctx.i18n.t("scenes.settings.info", {
          email: email || ctx.i18n.t("scenes.settings.emailNotSet")
        }),
        getSettingsMenu(ctx)
      );
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsUserExAccs(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.USER_EXCHANGE_ACCS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export { settingsEnter, settingsUserExAccs, settingsLeave };
