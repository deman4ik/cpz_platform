import { Extra } from "telegraf";
import dayjs from "../../../lib/dayjs";
import { cpz } from "../../../@types";
import { round, sortAsc } from "../../../utils/helpers";
import { getStatisticsText } from "../helpers";
import { getMainKeyboard } from "../keyboard";

function getUserRobotMenu(ctx: any) {
  const added = !!ctx.scene.state.selectedRobot.userRobotInfo;
  let status: cpz.Status = cpz.Status.stopped;
  if (added) {
    ({ status } = ctx.scene.state.selectedRobot.userRobotInfo);
  }

  return Extra.HTML().markup((m: any) => {
    return m.inlineKeyboard([
      [
        m.callbackButton(
          ctx.i18n.t("robot.menuInfo"),
          JSON.stringify({ a: "info" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("robot.menuMyStats"),
          JSON.stringify({ a: "myStat" }),
          !added
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("robot.menuPublStats"),
          JSON.stringify({ a: "pStat" }),
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("robot.menuPositions"),
          JSON.stringify({ a: "pos" }),
          !added
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userRobot.edit"),
          JSON.stringify({ a: "edit" }),
          !added || status !== cpz.Status.stopped
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userRobot.start"),
          JSON.stringify({ a: "start" }),
          !added || status !== cpz.Status.stopped
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userRobot.stop"),
          JSON.stringify({ a: "stop" }),
          !added ||
            ![
              cpz.Status.started,
              cpz.Status.starting,
              cpz.Status.paused
            ].includes(status)
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userRobot.add"),
          JSON.stringify({ a: "add" }),
          added
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.userRobot.delete"),
          JSON.stringify({ a: "delete" }),
          !added || status !== cpz.Status.stopped
        )
      ]
    ]);
  });
}

async function userRobotInfo(ctx: any) {
  try {
    if (
      ctx.scene.state.reload &&
      ctx.scene.state.reload === false &&
      ctx.scene.state.page &&
      ctx.scene.state.page === "info"
    )
      return;
    ctx.scene.state.page = "info";

    const { robotId } = ctx.scene.state;

    let robotInfo: cpz.RobotInfo;
    let userRobotInfo: cpz.UserRobotInfo;
    let market: cpz.Market;
    let equity: cpz.RobotEquity;

    if (!ctx.scene.state.selectedRobot || ctx.scene.state.reload) {
      ({ robotInfo, userRobotInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
        {
          robotId
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      ));

      ctx.scene.state.reload = false;
      ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };
    } else {
      ({ robotInfo, userRobotInfo } = ctx.scene.state.selectedRobot);
    }

    let userExAccText = "";
    if (userRobotInfo) {
      const { userExAccName } = userRobotInfo;
      userExAccText = ctx.i18n.t("robot.userExAcc", {
        name: userExAccName
      });
    }

    let statusText = "";
    if (userRobotInfo) {
      const { status } = userRobotInfo;
      statusText = ctx.i18n.t("robot.status", {
        status: ctx.i18n.t(`status.${status}`)
      });
    }

    let volumeText = "";
    if (userRobotInfo) {
      const {
        settings: { volume }
      } = userRobotInfo;
      volumeText = ctx.i18n.t("robot.volume", {
        volume,
        asset: robotInfo.asset
      });
    }

    let profitText = "";
    if (userRobotInfo) ({ equity } = userRobotInfo);
    else ({ equity } = robotInfo);

    if (equity && equity.profit && equity.lastProfit) {
      profitText = ctx.i18n.t("robot.profit", {
        profit: equity.profit,
        lastProfit:
          equity.lastProfit > 0 ? `+${equity.lastProfit}` : equity.lastProfit
      });
    }

    const message = `${ctx.i18n.t("robot.info", {
      ...robotInfo,
      signalsCount: round(1440 / robotInfo.timeframe),
      subscribed: userRobotInfo ? "✅" : ""
    })}${userExAccText}${statusText}${profitText}${volumeText}`;

    if (ctx.scene.state.reply) return ctx.reply(message, getUserRobotMenu(ctx));
    else return ctx.editMessageText(message, getUserRobotMenu(ctx));
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotPublicStats(ctx: any) {
  try {
    if (ctx.scene.state.page && ctx.scene.state.page === "publStats") return;
    ctx.scene.state.page = "publStats";
    const {
      robotInfo,
      userRobotInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
    } = ctx.scene.state.selectedRobot;
    const { statistics } = robotInfo;
    let message;

    if (statistics && Object.keys(statistics).length > 0)
      message = getStatisticsText(ctx, statistics);
    else message = ctx.i18n.t("robot.statsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t("robot.menuPublStats")}\n\n` +
        message,
      getUserRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotMyStats(ctx: any) {
  try {
    if (ctx.scene.state.page && ctx.scene.state.page === "myStats") return;
    ctx.scene.state.page = "myStats";
    const {
      robotInfo,
      userRobotInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
    } = ctx.scene.state.selectedRobot;
    const { statistics } = userRobotInfo;
    let message;
    if (statistics && Object.keys(statistics).length > 0)
      message = getStatisticsText(ctx, statistics);
    else message = ctx.i18n.t("robot.statsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t("robot.menuMyStats")}\n\n` +
        message,
      getUserRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotPositions(ctx: any) {
  try {
    if (ctx.scene.state.page && ctx.scene.state.page === "pos") return;
    ctx.scene.state.page = "pos";
    const {
      robotInfo,
      userRobotInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
    } = ctx.scene.state.selectedRobot;

    const { openPositions, closedPositions } = userRobotInfo;

    let openPositionsText = "";
    if (
      openPositions &&
      Array.isArray(openPositions) &&
      openPositions.length > 0
    ) {
      openPositions.forEach((pos: cpz.UserPositionDB) => {
        const posText = ctx.i18n.t("robot.positionOpen", {
          ...pos,
          entryAction: ctx.i18n.t(`tradeAction.${pos.entryAction}`),
          entryDate: dayjs.utc(pos.entryDate).format("YYYY-MM-DD HH:mm UTC")
        });
        openPositionsText = `${openPositionsText}\n\n${posText}\n`;
      });
      openPositionsText = ctx.i18n.t("robot.positionsOpen", {
        openPositions: openPositionsText
      });
    }

    let closedPositionsText = "";
    if (
      closedPositions &&
      Array.isArray(closedPositions) &&
      closedPositions.length > 0
    ) {
      closedPositions
        .sort((a, b) =>
          sortAsc(
            dayjs.utc(a.entryDate).valueOf(),
            dayjs.utc(b.entryDate).valueOf()
          )
        )
        .forEach((pos: cpz.UserPositionDB) => {
          const posText = ctx.i18n.t("robot.positionClosed", {
            ...pos,
            entryDate: dayjs.utc(pos.entryDate).format("YYYY-MM-DD HH:mm UTC"),
            exitDate: dayjs.utc(pos.exitDate).format("YYYY-MM-DD HH:mm UTC"),
            entryAction: ctx.i18n.t(`tradeAction.${pos.entryAction}`),
            exitAction: ctx.i18n.t(`tradeAction.${pos.exitAction}`)
          });
          closedPositionsText = `${closedPositionsText}\n\n${posText}`;
        });
      closedPositionsText = ctx.i18n.t("robot.positionsClosed", {
        closedPositions: closedPositionsText
      });
    }

    const message =
      openPositionsText !== "" || closedPositionsText !== ""
        ? `${closedPositionsText}${openPositionsText}`
        : ctx.i18n.t("robot.positionsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      }) + message,
      getUserRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotAdd(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ADD_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      reply: true,
      prevState: { ...ctx.scene.state, silent: false, reload: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotDelete(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.DELETE_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      reply: true,
      prevState: { ...ctx.scene.state, silent: false, reload: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotEdit(ctx: any) {
  try {
    ctx.scene.state.silent = true;

    await ctx.scene.enter(cpz.TelegramScene.EDIT_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      reply: true,
      prevState: {
        ...ctx.scene.state,
        silent: false,
        reload: true,
        reply: true
      }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotStart(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.START_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      reply: true,
      prevState: { ...ctx.scene.state, silent: false, reload: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotStop(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.STOP_USER_ROBOT, {
      selectedRobot: ctx.scene.state.selectedRobot,
      reply: true,
      prevState: { ...ctx.scene.state, silent: false, reload: true }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotBack(ctx: any) {
  try {
    if (!ctx.scene.state.prevScene) {
      ctx.scene.state.silent = false;
      return ctx.scene.leave();
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(ctx.scene.state.prevScene, ctx.scene.state.prevState);
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  userRobotInfo,
  userRobotPublicStats,
  userRobotMyStats,
  userRobotPositions,
  userRobotAdd,
  userRobotDelete,
  userRobotEdit,
  userRobotStart,
  userRobotStop,
  userRobotBack,
  userRobotLeave
};
