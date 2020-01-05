import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";

function getSignalsMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.signals.my"),
          JSON.stringify({ a: "mySignals" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.signals.search"),
          JSON.stringify({ a: "searchSignals" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.signals.perfomance"),
          JSON.stringify({ a: "perfSignals" }),
          false
        )
      ]
    ];

    return m.inlineKeyboard(buttons);
  });
}

async function signalsEnter(ctx: any) {
  try {
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.signals"),
      getBackKeyboard(ctx)
    );
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.signals"),
      getSignalsMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function signalsMySignals(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.MY_SIGNALS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function signalsSearchSignals(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SEARCH_SIGNALS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function signalsPerfSignals(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.PERFOMANCE_SIGNALS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function signalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  signalsEnter,
  signalsMySignals,
  signalsSearchSignals,
  signalsPerfSignals,
  signalsLeave
};
