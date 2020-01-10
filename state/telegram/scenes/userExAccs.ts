import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";

function getUserExAccsMenu(ctx: any) {
  const {
    userExAccs
  }: { userExAccs: cpz.UserExchangeAccount[] } = ctx.scene.state;
  return Extra.HTML().markup((m: any) => {
    const userExAccButtons = userExAccs.map(({ name, id, status }) => [
      m.callbackButton(
        `${name} ${status === cpz.UserExchangeAccStatus.enabled ? "✅" : "❌"}`,
        JSON.stringify({ a: "userExAcc", p: id }),
        false
      )
    ]);
    const buttons = [
      ...userExAccButtons,
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userExAccs.add"),
          JSON.stringify({ a: "addUserExAcc" }),
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

function getUserExAccsAddMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userExAccs.add"),
          JSON.stringify({ a: "addUserExAcc" }),
          false
        )
      ]
    ];
    return m.inlineKeyboard(buttons);
  });
}

async function userExAccsEnter(ctx: any) {
  try {
    const userExAccs = await this.broker.call(
      `${cpz.Service.DB_USER_EXCHANGE_ACCS}.find`,
      {
        query: {
          userId: ctx.session.user.id
        }
      }
    );
    if (!userExAccs || !Array.isArray(userExAccs) || userExAccs.length === 0) {
      if (ctx.scene.state.edit) {
        ctx.scene.state.edit = false;
        return ctx.editMessageText(
          ctx.i18n.t("scenes.userExAccs.none"),
          getUserExAccsAddMenu(ctx)
        );
      }
      return ctx.reply(
        ctx.i18n.t("scenes.userExAccs.none"),
        getUserExAccsAddMenu(ctx)
      );
    } else {
      ctx.scene.state.userExAccs = userExAccs;
      if (ctx.scene.state.edit) {
        ctx.scene.state.edit = false;
        return ctx.editMessageText(
          ctx.i18n.t("scenes.settings.userExAccs"),
          getUserExAccsMenu(ctx)
        );
      }
      return ctx.reply(
        ctx.i18n.t("scenes.settings.userExAccs"),
        getUserExAccsMenu(ctx)
      );
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccsSelectedAcc(ctx: any) {
  try {
    const { p: userExAccId } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.USER_EXCHANGE_ACC, {
      userExAcc: ctx.scene.state.userExAccs.find(
        ({ id }: cpz.UserExchangeAccount) => id === userExAccId
      ),
      edit: true,
      prevScene: cpz.TelegramScene.USER_EXCHANGE_ACCS,
      prevState: { userExAccs: ctx.scene.state.userExAccs }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccsAddAcc(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ADD_USER_EX_ACC, {
      edit: true,
      prevScene: cpz.TelegramScene.USER_EXCHANGE_ACCS,
      prevState: { userExAccs: ctx.scene.state.userExAccs }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccsBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SETTINGS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccsBackEdit(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SETTINGS, { edit: true });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userExAccsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  userExAccsEnter,
  userExAccsSelectedAcc,
  userExAccsAddAcc,
  userExAccsBack,
  userExAccsBackEdit,
  userExAccsLeave
};
