import { Markup } from "telegraf";

/**
 * Returns back keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getBackKeyboard = (ctx: any) => {
  const backKeyboardBack = ctx.i18n.t("keyboards.backKeyboard.back");
  let backKeyboard: any = Markup.keyboard([backKeyboardBack]);

  backKeyboard = backKeyboard.resize().extra();

  return {
    backKeyboard,
    backKeyboardBack
  };
};

/**
 * Returns main keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getMainKeyboard = (ctx: any) => {
  const mainKeyboardSignals = ctx.i18n.t("keyboards.mainKeyboard.signals");
  const mainKeyboardMySignals = ctx.i18n.t("keyboards.mainKeyboard.mySignals");
  const mainKeyboardSettings = ctx.i18n.t("keyboards.mainKeyboard.settings");
  const mainKeyboardFAQ = ctx.i18n.t("keyboards.mainKeyboard.faq");
  const mainKeyboardContact = ctx.i18n.t("keyboards.mainKeyboard.contact");
  let mainKeyboard: any = Markup.keyboard([
    [mainKeyboardSignals, mainKeyboardMySignals],
    //  [mainKeyboardSettings],
    [mainKeyboardFAQ, mainKeyboardContact]
  ]);
  mainKeyboard = mainKeyboard.resize().extra();

  return {
    mainKeyboard,
    mainKeyboardSignals,
    mainKeyboardMySignals,
    mainKeyboardSettings,
    mainKeyboardFAQ,
    mainKeyboardContact
  };
};
