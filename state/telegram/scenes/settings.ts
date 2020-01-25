import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";
import { sleep } from "../../../utils/helpers";

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
      ],
      //emailButton,
      notifSignalsTelegramButton,
      notifTradingTelegramButton,
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back" }),
          false
        )
      ]
    ];

    return m.inlineKeyboard(buttons);
  });
}

async function settingsEnter(ctx: any) {
  try {
    if (ctx.scene.state.reload)
      ctx.session.user = await this.broker.call(`${cpz.Service.DB_USERS}.get`, {
        id: ctx.session.user.id
      });

    const {
      email,
      settings: {
        notifications: {
          signals: { telegram: signalsTelegram },
          trading: { telegram: tradingTelegram }
        }
      }
    }: cpz.User = ctx.session.user;

    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      await ctx.editMessageText(
        ctx.i18n.t("scenes.settings.info", {
          email: email || ctx.i18n.t("scenes.settings.emailNotSet"),
          telegramSignalsNotif: signalsTelegram
            ? ctx.i18n.t("scenes.settings.telegramSingalsNotifOn")
            : ctx.i18n.t("scenes.settings.telegramSingalsNotifOff"),
          telegramTradingNotif: tradingTelegram
            ? ctx.i18n.t("scenes.settings.TelegramTradingNotifOn")
            : ctx.i18n.t("scenes.settings.TelegramTradingNotifOff")
        }),
        getSettingsMenu(ctx)
      );
    } else {
      await ctx.reply(
        ctx.i18n.t("keyboards.mainKeyboard.settings"),
        getBackKeyboard(ctx)
      );
      await sleep(100);
      await ctx.reply(
        ctx.i18n.t("scenes.settings.info", {
          email: email || ctx.i18n.t("scenes.settings.emailNotSet"),
          telegramSignalsNotif: signalsTelegram
            ? ctx.i18n.t("scenes.settings.telegramSingalsNotifOn")
            : ctx.i18n.t("scenes.settings.telegramSingalsNotifOff"),
          telegramTradingNotif: tradingTelegram
            ? ctx.i18n.t("scenes.settings.TelegramTradingNotifOn")
            : ctx.i18n.t("scenes.settings.TelegramTradingNotifOff")
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
    await ctx.scene.enter(cpz.TelegramScene.USER_EXCHANGE_ACCS, { edit: true });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsTurnTelegramSignalsNotifOn(ctx: any) {
  try {
    await this.broker.call(
      `${cpz.Service.DB_USERS}.setNotificationSettings`,
      {
        signalsTelegram: true
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.reload = true;
    ctx.scene.state.edit = true;
    return settingsEnter.call(this, ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsTurnTelegramSignalsNotifOff(ctx: any) {
  try {
    await this.broker.call(
      `${cpz.Service.DB_USERS}.setNotificationSettings`,
      {
        signalsTelegram: false
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.reload = true;
    ctx.scene.state.edit = true;
    return settingsEnter.call(this, ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsTurnTelegramTradingNotifOn(ctx: any) {
  try {
    await this.broker.call(
      `${cpz.Service.DB_USERS}.setNotificationSettings`,
      {
        tradingTelegram: true
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.reload = true;
    ctx.scene.state.edit = true;
    return settingsEnter.call(this, ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function settingsTurnTelegramTradingNotifOff(ctx: any) {
  try {
    await this.broker.call(
      `${cpz.Service.DB_USERS}.setNotificationSettings`,
      {
        tradingTelegram: false
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    ctx.scene.state.reload = true;
    ctx.scene.state.edit = true;
    return settingsEnter.call(this, ctx);
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

export {
  settingsEnter,
  settingsUserExAccs,
  settingsTurnTelegramSignalsNotifOn,
  settingsTurnTelegramSignalsNotifOff,
  settingsTurnTelegramTradingNotifOn,
  settingsTurnTelegramTradingNotifOff,
  settingsLeave
};
