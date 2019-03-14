import BaseTableStorageClient from "cpz/tableStorage-client";
import positionsTables, * as positionsMethods from "cpz/tableStorage-client/trade/positions";
import signalsTables, * as signalsMethods from "cpz/tableStorage-client/trade/signals";

class TradeClient extends BaseTableStorageClient {
  constructor() {
    super();

    this.addMethods(positionsTables, positionsMethods);
    this.addMethods(signalsTables, signalsMethods);
  }
}

export default TradeClient;
