import BaseTableStorageClient from "cpz/tableStorage-client";
import currentPricesTables, {
  getCurrentPrice
} from "cpz/tableStorage-client/market/currentPrices";

class MarketStorageClient extends BaseTableStorageClient {
  constructor() {
    super();

    this.addMethods(currentPricesTables, { getCurrentPrice });
  }
}

export default MarketStorageClient;
