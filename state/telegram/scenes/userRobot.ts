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
      ],
      [
        m.callbackButton(
          ctx.i18n.t("keyboards.backKeyboard.back"),
          JSON.stringify({ a: "back" }),
          false
        )
      ]
    ]);
  });
}

async function userRobotInfo(ctx: any) {
  try {
    if (ctx.scene.state.page && ctx.scene.state.page === "info") {
      if (
        ctx.scene.state.lastInfoUpdatedAt &&
        dayjs
          .utc()
          .diff(
            dayjs.utc(ctx.scene.state.lastInfoUpdatedAt),
            cpz.TimeUnit.second
          ) < 5
      )
        return;
      ctx.scene.state.edit = true;
    }

    let robotInfo: cpz.RobotInfo;
    let userRobotInfo: cpz.UserRobotInfo;
    let equity: cpz.RobotEquity;
    let market: cpz.Market;

    ({ robotInfo, userRobotInfo, market } = await this.broker.call(
      `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
      {
        robotId: ctx.scene.state.robotId
      },
      {
        meta: {
          user: ctx.session.user
        }
      }
    ));
    ctx.scene.state.lastInfoUpdatedAt = dayjs
      .utc()
      .format("YYYY-MM-DD HH:mm UTC");
    ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };

    let userExAccText = "";
    if (userRobotInfo) {
      const { userExAccName } = userRobotInfo;
      userExAccText = ctx.i18n.t("robot.userExAcc", {
        name: userExAccName
      });
    }

    let statusText = "";
    if (userRobotInfo) {
      const { status, startedAt, stoppedAt } = userRobotInfo;

      statusText = ctx.i18n.t("robot.status", {
        status: ctx.i18n.t(`status.${status}`)
      });
      if (status === cpz.Status.started && startedAt) {
        statusText = `${statusText}${ctx.i18n.t("robot.startedAt", {
          startedAt: dayjs.utc(startedAt).format("YYYY-MM-DD HH:mm UTC")
        })}`;
      }
      if (status === cpz.Status.stopped && stoppedAt) {
        statusText = `${statusText}${ctx.i18n.t("robot.stoppedAt", {
          stoppedAt: dayjs.utc(stoppedAt).format("YYYY-MM-DD HH:mm UTC")
        })}`;
      }
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

    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });

    const message = `${ctx.i18n.t("robot.info", {
      ...robotInfo,
      signalsCount: round(1440 / robotInfo.timeframe),
      subscribed: userRobotInfo ? "✅" : ""
    })}${userExAccText}${statusText}${profitText}${volumeText}${updatedAtText}`;

    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(message, getUserRobotMenu(ctx));
    }
    return ctx.reply(message, getUserRobotMenu(ctx));
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function userRobotPublicStats(ctx: any) {
  try {
    if (ctx.scene.state.page && ctx.scene.state.page === "publStats") {
      if (
        ctx.scene.state.lastInfoUpdatedAt &&
        dayjs
          .utc()
          .diff(
            dayjs.utc(ctx.scene.state.lastInfoUpdatedAt),
            cpz.TimeUnit.second
          ) < 5
      )
        return;
      const { robotInfo, userRobotInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
        {
          robotId: ctx.scene.state.robotId
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      ctx.scene.state.lastInfoUpdatedAt = dayjs
        .utc()
        .format("YYYY-MM-DD HH:mm UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };
    }
    ctx.scene.state.page = "publStats";
    const {
      robotInfo,
      userRobotInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
    } = ctx.scene.state.selectedRobot;
    const { statistics } = robotInfo;
    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });
    let message;

    if (statistics && Object.keys(statistics).length > 0)
      message = getStatisticsText(ctx, statistics);
    else message = ctx.i18n.t("robot.statsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t(
          "robot.menuPublStats"
        )}\n\n${message}\n\n${updatedAtText}`,
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
    if (ctx.scene.state.page && ctx.scene.state.page === "myStats") {
      if (
        ctx.scene.state.lastInfoUpdatedAt &&
        dayjs
          .utc()
          .diff(
            dayjs.utc(ctx.scene.state.lastInfoUpdatedAt),
            cpz.TimeUnit.second
          ) < 5
      )
        return;
      const { robotInfo, userRobotInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
        {
          robotId: ctx.scene.state.robotId
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      ctx.scene.state.lastInfoUpdatedAt = dayjs
        .utc()
        .format("YYYY-MM-DD HH:mm UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };
    }
    ctx.scene.state.page = "myStats";
    const {
      robotInfo,
      userRobotInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userRobotInfo: cpz.UserRobotInfo;
    } = ctx.scene.state.selectedRobot;
    const { statistics } = userRobotInfo;

    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });

    let message;
    if (statistics && Object.keys(statistics).length > 0)
      message = getStatisticsText(ctx, statistics);
    else message = ctx.i18n.t("robot.statsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t("robot.menuMyStats")}\n\n${message}\n\n${updatedAtText}`,
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
    if (ctx.scene.state.page && ctx.scene.state.page === "pos") {
      if (
        ctx.scene.state.lastInfoUpdatedAt &&
        dayjs
          .utc()
          .diff(
            dayjs.utc(ctx.scene.state.lastInfoUpdatedAt),
            cpz.TimeUnit.second
          ) < 5
      )
        return;
      const { robotInfo, userRobotInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_ROBOTS}.getUserRobot`,
        {
          robotId: ctx.scene.state.robotId
        },
        {
          meta: {
            user: ctx.session.user
          }
        }
      );
      ctx.scene.state.lastInfoUpdatedAt = dayjs
        .utc()
        .format("YYYY-MM-DD HH:mm UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userRobotInfo, market };
    }
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

    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });

    const message =
      openPositionsText !== "" || closedPositionsText !== ""
        ? `${closedPositionsText}${openPositionsText}`
        : ctx.i18n.t("robot.positionsNone");
    return ctx.editMessageText(
      `${ctx.i18n.t("robot.name", {
        name: robotInfo.name,
        subscribed: userRobotInfo ? "✅" : ""
      })}${message}\n\n${updatedAtText}`,
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
      prevState: { ...ctx.scene.state, silent: false }
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
      prevState: { ...ctx.scene.state, silent: false }
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
      prevState: {
        ...ctx.scene.state,
        silent: false
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
      prevState: { ...ctx.scene.state, silent: false }
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
      prevState: { ...ctx.scene.state, silent: false }
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

async function userRobotBackEdit(ctx: any) {
  try {
    if (!ctx.scene.state.prevScene) {
      ctx.scene.state.silent = false;
      return ctx.scene.leave();
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(ctx.scene.state.prevScene, {
      ...ctx.scene.state.prevState,
      edit: true
    });
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
  userRobotBackEdit,
  userRobotLeave
};
