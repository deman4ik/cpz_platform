import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

async function editUserExAccEnter(ctx: any) {
  try {
    const {
      name,
      exchange
    }: cpz.UserExchangeAccount = ctx.scene.state.userExAcc;
    ctx.scene.state.stage = "key";
    if (ctx.scene.state.reply) {
      await ctx.reply(
        ctx.i18n.t("scenes.editUserExAcc.enterAPIKey", { name, exchange }),
        Extra.HTML()
      );
    } else {
      await ctx.editMessageText(
        ctx.i18n.t("scenes.editUserExAcc.enterAPIKey", { name, exchange }),
        Extra.HTML()
      );
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function editUserExAccSubmited(ctx: any) {
  try {
    const {
      id,
      name,
      exchange
    }: cpz.UserExchangeAccount = ctx.scene.state.userExAcc;
    if (ctx.scene.state.stage === "key") {
      ctx.scene.state.key = ctx.message.text;
      ctx.scene.state.stage = "secret";
      await ctx.reply(
        ctx.i18n.t("scenes.editUserExAcc.enterAPISecret", { name, exchange }),
        Extra.HTML()
      );
    } else if (ctx.scene.state.stage === "secret") {
      ctx.scene.state.secret = ctx.message.text;
    } else {
      await editUserExAccEnter.call(this, ctx);
    }

    const {
      key,
      secret
    }: {
      key: string;
      secret: string;
    } = ctx.scene.state;

    const { success, result, error } = await this.broker.call(
      `${cpz.Service.DB_USER_EXCHANGE_ACCS}.upsert`,
      {
        id,
        exchange,
        keys: { key, secret }
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    if (success) {
      await ctx.reply(
        ctx.i18n.t("scenes.editUserExAcc.success", { name: result }),
        Extra.HTML()
      );
      await editUserExAccBack.call(this, ctx);
    } else {
      await ctx.reply(
        ctx.i18n.t("scenes.editUserExAcc.failed", {
          exchange,
          error: error || ctx.i18n.t("unknownError")
        }),
        Extra.HTML()
      );
      ctx.scene.state.key = null;
      ctx.scene.state.secret = null;
      ctx.scene.state.stage = null;
      await editUserExAccEnter.call(this, ctx);
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function editUserExAccBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(ctx.scene.state.prevScene, ctx.scene.state.prevState);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function editUserExAccLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  editUserExAccEnter,
  editUserExAccSubmited,
  editUserExAccBack,
  editUserExAccLeave
};
