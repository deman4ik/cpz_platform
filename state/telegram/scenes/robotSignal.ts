import { Extra } from "telegraf";
import dayjs from "../../../lib/dayjs";
import { cpz } from "../../../@types";
import { round, sortAsc } from "../../../utils/helpers";
import { getStatisticsText } from "../helpers";
import { getMainKeyboard } from "../keyboard";

function getSignalRobotMenu(ctx: any) {
  const subscribed = !!ctx.scene.state.selectedRobot.userSignalsInfo;

  return Extra.HTML().markup((m: any) => {
    const subscribeToggleButton = !subscribed
      ? m.callbackButton(
          ctx.i18n.t("scenes.robotSignal.subscribeSignals"),
          JSON.stringify({ a: "subscribe" }),
          false
        )
      : m.callbackButton(
          ctx.i18n.t("scenes.robotSignal.unsubscribeSignals"),
          JSON.stringify({ a: "unsubscribe" }),
          false
        );

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
          !subscribed
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
          false
        )
      ],
      [
        m.callbackButton(
          ctx.i18n.t("scenes.robotSignal.changeVolume"),
          JSON.stringify({ a: "changeVolume" }),
          !subscribed
        )
      ],
      [subscribeToggleButton],
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

async function robotSignalInfo(ctx: any) {
  try {
    if (
      ctx.scene.state.edit &&
      ctx.scene.state.page &&
      ctx.scene.state.page === "info"
    ) {
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
    }
    ctx.scene.state.page = "info";

    let robotInfo: cpz.RobotInfo;
    let userSignalsInfo: cpz.UserSignalsInfo;
    let currentSignals: cpz.UserSignalInfo[];
    let equity: cpz.RobotEquity;
    let market: cpz.Market;

    ({ robotInfo, userSignalsInfo, market } = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.getSignalRobot`,
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
      .format("YYYY-MM-DD HH:mm:ss UTC");

    ctx.scene.state.selectedRobot = { robotInfo, userSignalsInfo, market };

    let subscribedAtText = "";

    if (userSignalsInfo) {
      const { subscribedAt } = userSignalsInfo;
      subscribedAtText = ctx.i18n.t("robot.subscribedAt", {
        subscribedAt: dayjs.utc(subscribedAt).format("YYYY-MM-DD HH:mm UTC")
      });
    }

    let volumeText = "";
    if (userSignalsInfo) {
      const { volume } = userSignalsInfo;
      volumeText = ctx.i18n.t("robot.volume", {
        volume,
        asset: robotInfo.asset
      });
    }

    let profitText = "";
    if (userSignalsInfo) ({ equity } = userSignalsInfo);
    else ({ equity } = robotInfo);

    if (equity && equity.profit && equity.lastProfit) {
      profitText = ctx.i18n.t("robot.profit", {
        profit: equity.profit,
        lastProfit:
          equity.lastProfit > 0 ? `+${equity.lastProfit}` : equity.lastProfit
      });
    }

    let signalsText = "";
    if (userSignalsInfo) ({ currentSignals } = userSignalsInfo);
    else ({ currentSignals } = robotInfo);

    if (currentSignals.length > 0) {
      currentSignals.forEach(signal => {
        const actionText = ctx.i18n.t(`tradeAction.${signal.action}`);
        const orderTypeText = ctx.i18n.t(`orderType.${signal.orderType}`);
        const text = ctx.i18n.t("robot.signal", {
          code: signal.code,
          timestamp: dayjs
            .utc(signal.candleTimestamp)
            .format("YYYY-MM-DD HH:mm UTC"),
          action: actionText,
          orderType: orderTypeText,
          price: +signal.price
        });
        signalsText = `${signalsText}\n${text}`;
      });
    }
    if (signalsText !== "")
      signalsText = ctx.i18n.t("robot.signals", { signals: signalsText });

    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });

    const message = `${ctx.i18n.t("robot.info", {
      ...robotInfo,
      signalsCount: round(1440 / robotInfo.timeframe),
      subscribed: userSignalsInfo ? "✅" : ""
    })}${subscribedAtText}${profitText}${volumeText}${signalsText}${updatedAtText}`;

    if (ctx.scene.state.edit) {
      ctx.scene.state.edit = false;
      return ctx.editMessageText(message, getSignalRobotMenu(ctx));
    }
    return ctx.reply(message, getSignalRobotMenu(ctx));
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalPublicStats(ctx: any) {
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
      const { robotInfo, userSignalsInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobot`,
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
        .format("YYYY-MM-DD HH:mm:ss UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userSignalsInfo, market };
    }
    ctx.scene.state.page = "publStats";
    const {
      robotInfo,
      userSignalsInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userSignalsInfo: cpz.UserSignalsInfo;
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
        code: robotInfo.code,
        subscribed: userSignalsInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t(
          "robot.menuPublStats"
        )}\n\n${message}\n\n${updatedAtText}`,
      getSignalRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalMyStats(ctx: any) {
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
      const { robotInfo, userSignalsInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobot`,
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
        .format("YYYY-MM-DD HH:mm:ss UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userSignalsInfo, market };
    }
    ctx.scene.state.page = "myStats";
    const {
      robotInfo,
      userSignalsInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userSignalsInfo: cpz.UserSignalsInfo;
    } = ctx.scene.state.selectedRobot;
    const { statistics } = userSignalsInfo;
    const updatedAtText = ctx.i18n.t("robot.lastInfoUpdatedAt", {
      lastInfoUpdatedAt: ctx.scene.state.lastInfoUpdatedAt
    });
    let message;
    if (statistics && Object.keys(statistics).length > 0)
      message = getStatisticsText(ctx, statistics);
    else message = ctx.i18n.t("robot.statsNone");
    return ctx.editMessageText(
      ctx.i18n.t("robot.name", {
        code: robotInfo.code,
        subscribed: userSignalsInfo ? "✅" : ""
      }) +
        `${ctx.i18n.t("robot.menuMyStats")}\n\n${message}\n\n${updatedAtText}`,
      getSignalRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalPositions(ctx: any) {
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
      const { robotInfo, userSignalsInfo, market } = await this.broker.call(
        `${cpz.Service.DB_USER_SIGNALS}.getSignalRobot`,
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
        .format("YYYY-MM-DD HH:mm:ss UTC");
      ctx.scene.state.selectedRobot = { robotInfo, userSignalsInfo, market };
    }
    ctx.scene.state.page = "pos";
    const {
      robotInfo,
      userSignalsInfo
    }: {
      robotInfo: cpz.RobotInfo;
      userSignalsInfo: cpz.UserSignalsInfo;
    } = ctx.scene.state.selectedRobot;
    const subscribed = !!userSignalsInfo;
    let openPositions: cpz.RobotPositionState[] = [];
    let closedPositions: cpz.RobotPositionState[] = [];
    if (subscribed) {
      ({ openPositions, closedPositions } = userSignalsInfo);
    } else {
      ({ openPositions, closedPositions } = robotInfo);
    }

    let openPositionsText = "";
    if (
      openPositions &&
      Array.isArray(openPositions) &&
      openPositions.length > 0
    ) {
      openPositions.forEach((pos: cpz.RobotPositionState) => {
        const posText = ctx.i18n.t("robot.positionOpen", {
          ...pos,
          entryAction: ctx.i18n.t(`tradeAction.${pos.entryAction}`),
          entryDate: dayjs.utc(pos.entryDate).format("YYYY-MM-DD HH:mm UTC")
        });
        let signalsText = "";
        if (pos.alerts && Object.keys(pos.alerts).length > 0) {
          Object.values(pos.alerts).forEach(signal => {
            const actionText = ctx.i18n.t(`tradeAction.${signal.action}`);
            const orderTypeText = ctx.i18n.t(`orderType.${signal.orderType}`);
            const text = ctx.i18n.t("robot.signal", {
              code: pos.code,
              timestamp: dayjs
                .utc(signal.candleTimestamp)
                .format("YYYY-MM-DD HH:mm UTC"),
              action: actionText,
              orderType: orderTypeText,
              price: +signal.price
            });
            signalsText = `${signalsText}\n${text}`;
          });
          signalsText = ctx.i18n.t("robot.positionSignals", {
            signals: signalsText
          });
        }
        openPositionsText = `${openPositionsText}\n\n${posText}\n${signalsText}`;
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
        .forEach((pos: cpz.RobotPositionState) => {
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
        code: robotInfo.code,
        subscribed: userSignalsInfo ? "✅" : ""
      })}${message}${updatedAtText}`,
      getSignalRobotMenu(ctx)
    );
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalSubscribe(ctx: any) {
  try {
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.SUBSCRIBE_SIGNALS, {
      selectedRobot: ctx.scene.state.selectedRobot,
      prevState: {
        ...ctx.scene.state,
        page: null,
        silent: false,
        reload: true,
        edit: false
      }
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalUnsubscribe(ctx: any) {
  try {
    const {
      robotInfo
    }: {
      robotInfo: cpz.RobotInfo;
    } = ctx.scene.state.selectedRobot;
    const { success, error } = await this.broker.call(
      `${cpz.Service.DB_USER_SIGNALS}.unsubscribe`,
      { robotId: robotInfo.id },
      {
        meta: {
          user: ctx.session.user
        }
      }
    );
    if (success) {
      await ctx.reply(
        ctx.i18n.t("scenes.robotSignal.unsubscribedSignals", {
          code: robotInfo.code
        }),
        Extra.HTML()
      );
    } else {
      await ctx.reply(
        ctx.i18n.t("scenes.robotSignal.unsubscribedFailed", {
          code: robotInfo.code,
          error
        }),
        Extra.HTML()
      );
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(cpz.TelegramScene.ROBOT_SIGNAL, {
      ...ctx.scene.state,
      page: null,
      silent: false,
      reload: true,
      edit: false
    });
  } catch (e) {
    this.logger.error(e);
    ctx.scene.state.silent = false;
    await ctx.reply(ctx.i18n.t("failed"));
    await ctx.scene.leave();
  }
}

async function robotSignalBack(ctx: any) {
  try {
    if (!ctx.scene.state.prevScene) {
      ctx.scene.state.silent = false;
      return ctx.scene.leave();
    }
    ctx.scene.state.silent = true;
    await ctx.scene.enter(ctx.scene.state.prevScene, {
      ...ctx.scene.state.prevState,
      reload: true
    });
  } catch (e) {
    this.logger.error(e);
    await ctx.reply(ctx.i18n.t("failed"));
    ctx.scene.state.silent = false;
    await ctx.scene.leave();
  }
}

async function robotSignalBackEdit(ctx: any) {
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

async function robotSignalLeave(ctx: any) {
  if (ctx.scene.state.silent) return;
  await ctx.reply(ctx.i18n.t("menu"), getMainKeyboard(ctx));
}

export {
  robotSignalInfo,
  robotSignalPublicStats,
  robotSignalMyStats,
  robotSignalPositions,
  robotSignalSubscribe,
  robotSignalUnsubscribe,
  robotSignalBack,
  robotSignalBackEdit,
  robotSignalLeave
};
