import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

async function editUserRobotEnter(ctx: any) {
  try {
    const {
      robotInfo,
      market
    }: {
      robotInfo: cpz.RobotInfo;
      market: cpz.Market;
    } = ctx.scene.state.selectedRobot;
    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(
        ctx.i18n.t("scenes.editUserRobot.enterVolume", {
          code: robotInfo.code,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.editUserRobot.enterVolume", {
        code: robotInfo.code,
        asset: robotInfo.asset,
        minVolume: market.limits.amount.min
      }),
      Extra.HTML()
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function editUserRobotConfirm(ctx: any) {
  try {
    const { id } = ctx.scene.state.selectedRobot.userRobotInfo;
    let volume: number;
    let error: string;
    try {
      volume = parseFloat(ctx.message.text);
      if (isNaN(volume)) error = "Volume is not a number";
    } catch (e) {
      error = e.message;
    }

    if (!error) {
      ({ error } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.edit`,
        {
          id,
          settings: {
            volume
          }
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      ));
    }

    if (error) {
      const {
        robotInfo,
        market
      }: {
        robotInfo: cpz.RobotInfo;
        market: cpz.Market;
      } = ctx.scene.state.selectedRobot;
      await ctx.reply(
        ctx.i18n.t("scenes.editUserRobot.wrongVolume", {
          code: robotInfo.code,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
      ctx.scene.state.reply = true;
      return editUserRobotEnter.call(this, ctx);
    }

    await ctx.reply(
      ctx.i18n.t("scenes.editUserRobot.success", {
        code: ctx.scene.state.selectedRobot.robotInfo.code,
        volume,
        asset: ctx.scene.state.selectedRobot.robotInfo.asset
      }),
      Extra.HTML()
    );
    ctx.scene.state.silent = true;
    await ctx.scene.enter(
      cpz.TelegramScene.USER_ROBOT,
      ctx.scene.state.prevState
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function editUserRobotBack(ctx: any) {
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

async function editUserRobotLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  editUserRobotEnter,
  editUserRobotConfirm,
  editUserRobotBack,
  editUserRobotLeave
};
