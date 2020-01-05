import { Extra } from "telegraf";
import { getMainKeyboard } from "../keyboard";
import { cpz } from "../../../@types";

function getUserExAccMenu(ctx: any) {
  const { status }: cpz.UserExchangeAccount = ctx.scene.state.userExAcc;
  return Extra.HTML().markup((m: any) => {
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userExAcc.edit"),
          JSON.stringify({ a: "edit" }),
          status === cpz.UserExchangeAccStatus.enabled
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userExAcc.delete"),
          JSON.stringify({ a: "delete" }),
          false
        )
      ],
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

async function userExAccEnter(ctx: any) {
  try {
    const { name, status }: cpz.UserExchangeAccount = ctx.scene.state.userExAcc;

    if (ctx.scene.state.reply) {
      return ctx.reply(
        ctx.i18n.t("scenes.userExAcc.info", {
          name,
          status
        }),
        getUserExAccMenu(ctx)
      );
    }
    return ctx.editMessageText(
      ctx.i18n.t("scenes.userExAcc.info", {
        name,
        status
      }),
      getUserExAccMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccEdit(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.EDIT_USER_EX_ACC, {
      userExAcc: ctx.scene.state.userExAcc,
      prevScene: cpz.TelegramScene.USER_EXCHANGE_ACC,
      prevState: ctx.scene.state
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccDelete(ctx: any) {
  try {
    const { id, name }: cpz.UserExchangeAccount = ctx.scene.state.userExAcc;

    const { success, error } = await this.broker.call(
      `${cpz.Service.DB_USER_EXCHANGE_ACCS}.delete`,
      {
        id
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    if (success) {
      await ctx.editMessageText(
        ctx.i18n.t("scenes.userExAcc.deleteSuccess", {
          name
        }),
        Extra.HTML()
      );
      ctx.scene.state.reply = true;
      await userExAccBack(ctx);
    } else {
      await ctx.reply(
        ctx.i18n.t("scenes.userExAcc.deleteFailed", {
          name,
          error: error || ctx.i18n.t("unknownError")
        }),
        Extra.HTML()
      );
      ctx.scene.state.reply = true;
      await userExAccEnter(ctx);
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.USER_EXCHANGE_ACCS, {
      silent: false
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  userExAccEnter,
  userExAccEdit,
  userExAccDelete,
  userExAccBack,
  userExAccLeave
};
