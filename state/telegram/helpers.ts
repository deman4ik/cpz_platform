import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";

function getStatisticsText(ctx: any, statistics: cpz.RobotStats) {
  return `${ctx.i18n.t("robot.statsProfit", statistics)}${ctx.i18n.t(
    "robot.statsWinners",
    statistics
  )}${ctx.i18n.t("robot.statsLosses", statistics)}${ctx.i18n.t(
    "robot.statsLastUpdatedAt",
    {
      lastUpdatedAt: dayjs
        .utc(statistics.lastUpdatedAt)
        .format("YYYY-MM-DD HH:mm UTC")
    }
  )}`;
}

export { getStatisticsText };
