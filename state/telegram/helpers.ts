import { cpz } from "../../@types";
import dayjs from "../../lib/dayjs";

function getStatisticsText(
  ctx: any,
  statistics: cpz.RobotStats,
  volume?: number,
  asset?: string
) {
  let volumeText = "";
  if (volume && asset)
    volumeText = ctx.i18n.t("robot.volume", {
      volume,
      asset
    });
  return `${volumeText}${ctx.i18n.t("robot.statsProfit", {
    ...statistics,
    maxDrawdownDate: {
      all:
        statistics.maxDrawdownDate.all &&
        dayjs
          .utc(statistics.maxDrawdownDate.all)
          .format("YYYY-MM-DD HH:mm UTC"),
      long:
        statistics.maxDrawdownDate.long &&
        dayjs
          .utc(statistics.maxDrawdownDate.long)
          .format("YYYY-MM-DD HH:mm UTC"),
      short:
        statistics.maxDrawdownDate.short &&
        dayjs
          .utc(statistics.maxDrawdownDate.short)
          .format("YYYY-MM-DD HH:mm UTC")
    }
  })}${ctx.i18n.t("robot.statsWinners", statistics)}${ctx.i18n.t(
    "robot.statsLosses",
    statistics
  )}${ctx.i18n.t("robot.statsLastUpdatedAt", {
    lastUpdatedAt: dayjs
      .utc(statistics.lastUpdatedAt)
      .format("YYYY-MM-DD HH:mm UTC")
  })}`;
}

export { getStatisticsText };
