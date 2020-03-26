import { ServiceBroker } from "moleculer";
import BaseExwatcher from "../../mixins/base-exwatcher";

class BinanceFuturesWatcherService extends BaseExwatcher {
  constructor(broker: ServiceBroker) {
    super(broker);
  }
  exchange: string = "binance_futures";
}

export = BinanceFuturesWatcherService;
