import { capitalize } from "../utils/helpers";
import Timeframe from "../utils/timeframe";

const createRobotCode = (
  exchange: string,
  asset: string,
  currency: string,
  timeframe: number,
  strategy: string,
  mod: string
) =>
  `${strategy}_${mod}_${capitalize(
    exchange
  )}_${asset}_${currency}_${Timeframe.toString(timeframe)}`;

const createRobotName = (
  exchange: string,
  asset: string,
  currency: string,
  timeframe: number,
  strategy: string,
  mod: string
) =>
  `${strategy}-${mod} ${capitalize(
    exchange
  )} ${asset}/${currency} ${Timeframe.toString(timeframe)}`;

export { createRobotCode, createRobotName };
