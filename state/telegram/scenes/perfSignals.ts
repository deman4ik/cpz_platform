import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getStatisticsText } from "../helpers";
import { getMainKeyboard } from "../keyboard";

function getPerfSignalsMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = [
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

async function perfSignalsEnter(ctx: any) {
  try {
    const [userAggrStats]: cpz.UserAggrStatsDB[] = await this.broker.call(
      `${cpz.Service.DB_USER_AGGR_STATS}.find`,
      {
        query: {
          type: "signal",
          userId: ctx.session.user.id,
          exchange: null,
          asset: null
        }
      }
    );
    let message;
    if (
      userAggrStats &&
      userAggrStats.statistics &&
      Object.keys(userAggrStats.statistics).length > 0
    )
      message = getStatisticsText(ctx, userAggrStats.statistics);
    else message = ctx.i18n.t("scenes.perfSignals.perfNone");
    return ctx.editMessageText(
      `${ctx.i18n.t("scenes.perfSignals.info")}\n\n` + message,
      getPerfSignalsMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function perfSignalsBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SIGNALS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function perfSignalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export { perfSignalsEnter, perfSignalsBack, perfSignalsLeave };
