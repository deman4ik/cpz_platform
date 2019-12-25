import { Extra } from "telegraf";
import { getMainKeyboard, getBackKeyboard } from "../keyboard";
import { cpz } from "../../../@types";

function getRobotsMenu(ctx: any) {
  return Extra.HTML().markup((m: any) => {
    const buttons = [
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.my"),
          JSON.stringify({ a: "myRobots" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.search"),
          JSON.stringify({ a: "searchRobots" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robots.perfomance"),
          JSON.stringify({ a: "perfRobots" }),
          false
        )
      ]
    ];

    return m.inlineKeyboard(buttons);
  });
}

async function robotsEnter(ctx: any) {
  try {
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.robots"),
      getBackKeyboard(ctx)
    );
    await ctx.reply(
      ctx.i18n.t("keyboards.mainKeyboard.robots"),
      getRobotsMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function robotsMyRobots(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.MY_ROBOTS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function robotsSearchRobots(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SEARCH_ROBOTS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function robotsPerfRobots(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.PERFOMANCE_ROBOTS);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function robotsLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  robotsEnter,
  robotsMyRobots,
  robotsSearchRobots,
  robotsPerfRobots,
  robotsLeave
};