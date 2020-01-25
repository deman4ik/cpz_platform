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

async function startUserRobotEnter(ctx: any) {
  try {
    const {
      robotInfo
    }: { robotInfo: cpz.RobotInfo } = ctx.scene.state.selectedRobot;

    return ctx.reply(
      ctx.i18n.t("scenes.startUserRobot.confirm", {
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

async function startUserRobotYes(ctx: any) {
  try {
    const { robotInfo, userRobotInfo } = ctx.scene.state.selectedRobot;

    const { error } = await this.broker.call(
      `${cpz.Service.USER_ROBOT_RUNNER}.start`,
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
        ctx.i18n.t("scenes.startUserRobot.failed", {
          code: robotInfo.code,
          error
        }),
        Extra.HTML()
      );
      return startUserRobotBack.call(this, ctx);
    }

    await ctx.reply(
      ctx.i18n.t("scenes.startUserRobot.success", {
        code: ctx.scene.state.selectedRobot.robotInfo.code
      }),
      Extra.HTML()
    );
    ctx.scene.state.silent = false;
    await startUserRobotBack.call(this, ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function startUserRobotBack(ctx: any) {
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

async function startUserRobotLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  startUserRobotEnter,
  startUserRobotYes,
  startUserRobotBack,
  startUserRobotLeave
};
