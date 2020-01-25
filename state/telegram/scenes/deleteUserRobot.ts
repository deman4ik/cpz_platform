import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

function getConfirmMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    return m.inlineKeyboard([
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.confirm.yes"),
          JSON.stringify({ a: "yes" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.confirm.no"),
          JSON.stringify({ a: "no" }),
          false
        )
      ]
    ]);
  });
}

async function deleteUserRobotEnter(ctx: any) {
  try {
    const {
      robotInfo
    }: { robotInfo: cpz.RobotInfo } = ctx.scene.state.selectedRobot;

    return ctx.reply(
      ctx.i18n.t("scenes.deleteUserRobot.confirm", {
        code: robotInfo.code
      }),
      getConfirmMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function deleteUserRobotYes(ctx: any) {
  try {
    const { robotInfo, userRobotInfo } = ctx.scene.state.selectedRobot;

    const { error } = await this.broker.call(
      `${cpz.Service.DB_USER_ROBOTS}.delete`,
      {
        id: userRobotInfo.id
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );

    if (error) {
      await ctx.reply(
        ctx.i18n.t("scenes.deleteUserRobot.failed", {
          code: robotInfo.code,
          error
        }),
        Extra.HTML()
      );
      ctx.scene.state.reply = true;
      return deleteUserRobotBack.call(this, ctx);
    }

    await ctx.reply(
      ctx.i18n.t("scenes.deleteUserRobot.success", {
        code: ctx.scene.state.selectedRobot.robotInfo.code
      }),
      Extra.HTML()
    );
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function deleteUserRobotBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.USER_ROBOT, {
      ...ctx.scene.state.prevState,
      edit: false,
      reload: true
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function deleteUserRobotLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  deleteUserRobotEnter,
  deleteUserRobotYes,
  deleteUserRobotBack,
  deleteUserRobotLeave
};
