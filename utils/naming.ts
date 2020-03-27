import { capitalize } from "../utils/helpers";
import Timeframe from "../utils/timeframe";

function formatExchange(exchange: string) {
  return exchange
    .split("_")
    .map(val => capitalize(val))
    .join(" ");
}

function robotExchangeName(exchange: string, delim: string = " ") {
  const formated = formatExchange(exchange).split(" ");
  return `${formated[0]}${delim}${formated[1].substring(0, 3)}`;
}

function createRobotCode(
  exchange: string,
  asset: string,
  currency: string,
  timeframe: number,
  strategy: string,
  mod: string
) {
  return `${strategy}_${mod}_${robotExchangeName(
    exchange,
    "_"
  )}_${asset}_${currency}_${Timeframe.toString(timeframe)}`;
}

function createRobotName(
  exchange: string,
  asset: string,
  currency: string,
  timeframe: number,
  strategy: string,
  mod: string
) {
  return `${strategy}-${mod} ${robotExchangeName(
    exchange
  )} ${asset}/${currency} ${Timeframe.toString(timeframe)}`;
}

export { formatExchange, createRobotCode, createRobotName };
