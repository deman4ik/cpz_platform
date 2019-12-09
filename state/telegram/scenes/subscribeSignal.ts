import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { Errors } from "moleculer";
import { getMainKeyboard } from "../keyboard";

async function signalsSubscribeEnter(ctx: any) {
  try {
    const {
      robotInfo,
      market
    }: {
      robotInfo: cpz.RobotInfo;
      market: cpz.Market;
    } = ctx.scene.state.selectedRobot;
    await ctx.editMessageText(
      ctx.i18n.t("scenes.subscribeSignals.enterVolume", {
        asset: robotInfo.asset,
        minVolume: market.limits.amount.min
      }),
      Extra.HTML()
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function signalsSubscribeConfirm(ctx: any) {
  try {
    this.logger.info(ctx.message);

    const { id: robotId } = ctx.scene.state.selectedRobot.robotInfo;
    let volume: number;
    try {
      volume = parseFloat(ctx.message.text);
      if (isNaN(volume))
        throw new Errors.ValidationError("Volume is not a number");
      await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.subscribe`,
        { robotId, telegram: true, volume },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
    } catch (e) {
      if (e instanceof Errors.ValidationError) {
        const {
          robotInfo,
          market
        }: {
          robotInfo: cpz.RobotInfo;
          market: cpz.Market;
        } = ctx.scene.state.selectedRobot;
        await ctx.reply(
          ctx.i18n.t("scenes.subscribeSignals.wrongVolume", {
            asset: robotInfo.asset,
            minVolume: market.limits.amount.min
          }),
          Extra.HTML()
        );
        await ctx.scene.reenter();
        return;
      }
      this.logger.error(e);
      throw e;
    }
    await ctx.reply(
      ctx.i18n.t("scenes.subscribeSignals.subscribedSignals", {
        name: ctx.scene.state.selectedRobot.robotInfo.name,
        volume,
        asset: ctx.scene.state.selectedRobot.robotInfo.asset
      }),
      Extra.HTML()
    );
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      ...ctx.scene.state.prevState,
      reload: true,
      reply: true
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function signalsSubscribeBack(ctx: any) {
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

async function signalsSubscribeLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  signalsSubscribeEnter,
  signalsSubscribeConfirm,
  signalsSubscribeBack,
  signalsSubscribeLeave
};
