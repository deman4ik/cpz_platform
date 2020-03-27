import { ServiceBroker } from "moleculer";
import BaseExwatcher from "../../mixins/base-exwatcher";

class BitfinexWatcherService extends BaseExwatcher {
  constructor(broker: ServiceBroker) {
    super("bitfinex", broker);
  }
}

export = BitfinexWatcherService;
