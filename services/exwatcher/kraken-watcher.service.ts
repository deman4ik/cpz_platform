import { ServiceBroker } from "moleculer";
import BaseExwatcher from "../../mixins/base-exwatcher";

class KrakenWatcherService extends BaseExwatcher {
  constructor(broker: ServiceBroker) {
    super("kraken", broker);
  }
}

export = KrakenWatcherService;
