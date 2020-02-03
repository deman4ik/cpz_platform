import { expose } from "threads/worker";
import { calcStatistics } from "../utils/tradeStatistics";

const statisticUtils = {
  calcStatistics
};
export type StatisticUtils = typeof statisticUtils;

expose(statisticUtils);
