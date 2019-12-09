import { cpz } from "../../@types";

function getStatisticsText(ctx: any, statistics: cpz.RobotStats) {
  return `${ctx.i18n.t("robot.statsProfit", statistics)}${ctx.i18n.t(
    "robot.statsWinners",
    statistics
  )}${ctx.i18n.t("robot.statsLosses", statistics)}${ctx.i18n.t(
    "robot.statsLastUpdatedAt",
    statistics
  )}`;
}

export { getStatisticsText };
