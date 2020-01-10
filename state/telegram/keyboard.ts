import { Markup } from "telegraf";

/**
 * Returns back keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getBackKeyboard = (ctx: any) => {
  const backKeyboardBack = ctx.i18n.t("keyboards.backKeyboard.back");
  const backKeyboardMenu = ctx.i18n.t("keyboards.backKeyboard.menu");
  let backKeyboard: any = Markup.keyboard([
    [backKeyboardBack, backKeyboardMenu]
  ]);

  backKeyboard = backKeyboard.resize().extra();

  return backKeyboard;
};

/**
 * Returns main keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getMainKeyboard = (ctx: any) => {
  const mainKeyboardSignals = ctx.i18n.t("keyboards.mainKeyboard.signals");
  const mainKeyboardRobots = ctx.i18n.t("keyboards.mainKeyboard.robots");
  const mainKeyboardSettings = ctx.i18n.t("keyboards.mainKeyboard.settings");
  const mainKeyboardSupport = ctx.i18n.t("keyboards.mainKeyboard.support");
  const mainKeyboardDonation = ctx.i18n.t("keyboards.mainKeyboard.donation");
  let mainKeyboard: any = Markup.keyboard([
    [mainKeyboardSignals, mainKeyboardRobots],
    [mainKeyboardSettings, mainKeyboardSupport],
    [mainKeyboardDonation]
  ]);
  mainKeyboard = mainKeyboard.resize().extra();

  return mainKeyboard;
};
