import { Extra } from "telegraf";
import { getBackKeyboard, getMainKeyboard } from "../keyboard";
import { chunkArray } from "../../../utils/helpers";
import { scenes } from "../locales/en.json";

function getFAQMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = Object.keys(scenes.faq.q).map(key =>
      m.callbackButton(
        ctx.i18n.t(`scenes.faq.q.${key}`),
        JSON.stringify({ a: "q", p: key.toString() }),
        false
      )
    );
    const chunkedButtons = chunkArray(buttons, 2);
    return m.inlineKeyboard(chunkedButtons);
  });
}

async function faqEnter(ctx: any) {
  try {
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.faq"),
      getBackKeyboard(ctx)
    );

    return ctx.reply(ctx.i18n.t("scenes.faq.title"), getFAQMenu(ctx));
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function faqSelected(ctx: any) {
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

async function faqLeave(ctx: any) {
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export { faqEnter, faqSelected, faqLeave };
