import { ServiceBroker } from "moleculer";
import BaseExwatcher from "../../mixins/base-exwatcher";

class BinanceFuturesWatcherService extends BaseExwatcher {
  constructor(broker: ServiceBroker) {
    super("binance_futures", broker);
  }
}

export = BinanceFuturesWatcherService;
