import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

function getSignalsListMenu(ctx: any) {
  const {
    myRobots
  }: { myRobots: { id: string; name: string }[] } = ctx.scene.state;
  return Extra.HTML().markup((m: any) => {
    const buttons = myRobots.map(({ name, id }) => [
      m.callbackButton(`${name}`, JSON.stringify({ a: "robot", p: id }), false)
    ]);

    return m.inlineKeyboard(buttons);
  });
}

async function mySignalsEnter(ctx: any) {
  try {
    let myRobots;
    if (ctx.scene.state.myRobots) myRobots = ctx.scene.state.myRobots;
    else
      myRobots = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobots`,
        {
          userId: ctx.session.user.id
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
    if (!myRobots || !Array.isArray(myRobots) || myRobots.length === 0) {
      await ctx.editMessageText(ctx.i18n.t("scenes.mySignals.robotsNone"));
      ctx.scene.state.silent = true;
      await ctx.scene.enter(cpz.TelegramScene.SEARCH_SIGNALS, {
        reply: true
      });
    } else {
      ctx.scene.state.myRobots = myRobots;
      if (ctx.scene.state.reply)
        return ctx.reply(
          ctx.i18n.t("scenes.mySignals.robotsList"),
          getSignalsListMenu(ctx)
        );
      return ctx.editMessageText(
        ctx.i18n.t("scenes.mySignals.robotsList"),
        getSignalsListMenu(ctx)
      );
    }
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function mySignalsSelectedRobot(ctx: any) {
  try {
    const { p: robotId } = JSON.parse(ctx.callbackQuery.data);
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      robotId,
      prevScene: cpz.TelegramScene.MY_SIGNALS,
      prevState: { myRobots: ctx.scene.state.myRobots, reply: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function mySignalsBack(ctx: any) {
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

async function mySignalsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  mySignalsEnter,
  mySignalsSelectedRobot,
  mySignalsBack,
  mySignalsLeave
};
