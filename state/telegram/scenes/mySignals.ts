import { Extra } from "telegraf";
import { cpz } from "../../../@types";
import { getMainKeyboard } from "../keyboard";

const PAGE_SIZE = 7;

function getSignalsListMenu(ctx: any) {
  const {
    currentRobots,
    hasNextPage,
    hasPrevPage
  }: {
    currentRobots: { id: string; name: string }[];
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } = ctx.scene.state;
  return Extra.HTML().markup((m: any) => {
    const buttons = currentRobots.map(({ name, id }) => [
      m.callbackButton(`${name}`, JSON.stringify({ a: "robot", p: id }), false)
    ]);

    return m.inlineKeyboard([
      ...buttons,
      [
        m.callbackButton(
          "⬅️ Previous Page",
          JSON.stringify({ a: "prev" }),
          !hasPrevPage
        ),
        m.callbackButton(
          "Next Page ➡️",
          JSON.stringify({ a: "next" }),
          !hasNextPage
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back" }),
          false
        ),
        m.callbackButton(
          ctx.i18n.t("scenes.mySignals.add"),
          JSON.stringify({ a: "add" }),
          false
        )
      ]
    ]);
  });
}

async function mySignalsEnter(ctx: any) {
  try {
    let myRobots;
    if (ctx.scene.state.myRobots && !ctx.scene.state.reload)
      myRobots = ctx.scene.state.myRobots;
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
      await ctx.scene.enter(cpz.TelegramScene.SEARCH_SIGNALS);
    } else {
      ctx.scene.state.myRobots = myRobots;
      ctx.scene.state.pages = Math.ceil(
        ctx.scene.state.myRobots.length / PAGE_SIZE
      );
      ctx.scene.state.currentPage = 1;
      ctx.scene.state.hasNextPage =
        ctx.scene.state.currentPage < ctx.scene.state.pages;
      ctx.scene.state.hasPrevPage = ctx.scene.state.currentPage > 1;
      ctx.scene.state.currentRobots = ctx.scene.state.myRobots.slice(
        (ctx.scene.state.currentPage - 1) * PAGE_SIZE,
        ctx.scene.state.currentPage * PAGE_SIZE
      );
      if (ctx.scene.state.edit) {
        ctx.scene.state.edit = false;
        return ctx.editMessageText(
          ctx.i18n.t("scenes.mySignals.robotsList"),
          getSignalsListMenu(ctx)
        );
      }
      return ctx.reply(
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

async function mySingalsNextPage(ctx: any) {
  try {
    ctx.scene.state.currentPage += 1;
    if (ctx.scene.state.currentPage > ctx.scene.state.pages) return;
    ctx.scene.state.hasNextPage =
      ctx.scene.state.currentPage < ctx.scene.state.pages;
    ctx.scene.state.hasPrevPage = ctx.scene.state.currentPage > 1;
    ctx.scene.state.currentRobots = ctx.scene.state.myRobots.slice(
      (ctx.scene.state.currentPage - 1) * PAGE_SIZE,
      ctx.scene.state.currentPage * PAGE_SIZE
    );
    return ctx.editMessageText(
      ctx.i18n.t("scenes.mySignals.robotsList"),
      getSignalsListMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function mySingalsPrevPage(ctx: any) {
  try {
    ctx.scene.state.currentPage += 1;
    if (ctx.scene.state.currentPage < 1) return;
    ctx.scene.state.hasNextPage =
      ctx.scene.state.currentPage < ctx.scene.state.pages;
    ctx.scene.state.hasPrevPage = ctx.scene.state.currentPage > 1;
    ctx.scene.state.currentRobots = ctx.scene.state.myRobots.slice(
      (ctx.scene.state.currentPage - 1) * PAGE_SIZE,
      ctx.scene.state.currentPage * PAGE_SIZE
    );
    return ctx.editMessageText(
      ctx.i18n.t("scenes.mySignals.robotsList"),
      getSignalsListMenu(ctx)
    );
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
      edit: true,
      prevScene: cpz.TelegramScene.MY_SIGNALS,
      prevState: { myRobots: ctx.scene.state.myRobots }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function mySignalsAdd(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SEARCH_SIGNALS);
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

async function mySignalsBackEdit(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SIGNALS, { edit: true });
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
  mySingalsNextPage,
  mySingalsPrevPage,
  mySignalsSelectedRobot,
  mySignalsAdd,
  mySignalsBack,
  mySignalsBackEdit,
  mySignalsLeave
};
