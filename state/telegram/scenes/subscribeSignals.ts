import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

async function subscribeSignalsEnter(ctx: any) {
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
        ctx.i18n.t("scenes.subscribeSignals.enterVolume", {
          name: robotInfo.name,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
    }
    return ctx.reply(
      ctx.i18n.t("scenes.subscribeSignals.enterVolume", {
        name: robotInfo.name,
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

async function subscribeSignalsConfirm(ctx: any) {
  try {
    this.logger.info(ctx.message);

    const { id: robotId } = ctx.scene.state.selectedRobot.robotInfo;
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
        `${cpz.Service.DB_USER_SIGNALS}.subscribe`,
        { robotId, telegram: true, volume },
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
        ctx.i18n.t("scenes.subscribeSignals.wrongVolume", {
          name: robotInfo.name,
          asset: robotInfo.asset,
          minVolume: market.limits.amount.min
        }),
        Extra.HTML()
      );
      return subscribeSignalsEnter(ctx);
    }

    await ctx.reply(
      ctx.i18n.t("scenes.subscribeSignals.subscribedSignals", {
        name: ctx.scene.state.selectedRobot.robotInfo.name,
        volume,
        asset: ctx.scene.state.selectedRobot.robotInfo.asset
      }),
      Extra.HTML()
    );
    return subscribeSignalsBack(ctx);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function subscribeSignalsBack(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(
      cpz.TelegramScene.ROBOT_SIGNAL,
      ctx.scene.state.prevState
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function subscribeSignalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  subscribeSignalsEnter,
  subscribeSignalsConfirm,
  subscribeSignalsBack,
  subscribeSignalsLeave
};
