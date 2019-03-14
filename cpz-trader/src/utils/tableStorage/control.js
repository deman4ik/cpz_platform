import BaseTableStorageClient from "cpz/tableStorage-client";
import tradersTables, * as tradersMethods from "cpz/tableStorage-client/control/traders";

class ControlStorageClient extends BaseTableStorageClient {
  constructor() {
    super();
    this.addMethods(tradersTables, tradersMethods);
  }
}

export default ControlStorageClient;
