import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";
import { sleep } from "../../../utils/helpers";

async function supportEnter(ctx: any) {
  try {
    const message = `${ctx.i18n.t("scenes.support.info1")}${ctx.i18n.t(
      "scenes.support.info2"
    )}${ctx.i18n.t("scenes.support.info3")}${ctx.i18n.t(
      "scenes.support.info4"
    )}`;
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.support"),
      getBackKeyboard(ctx)
    );
    await sleep(100);
    await ctx.reply(message, Extra.HTML());
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function supportMessage(ctx: any) {
  try {
    const message = ctx.message.text;

    await this.broker.call(
      `${cpz.Service.DB_MESSAGES}.supportMessage`,
      {
        message
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );

    await ctx.reply(ctx.i18n.t("scenes.support.success"), Extra.HTML());
    return supportLeave.call(this, ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function supportLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export { supportEnter, supportLeave, supportMessage };
