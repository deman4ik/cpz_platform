import {
  BaseConnectorAPI,
  createOrder,
  cancelOrder,
  checkOrder
} from "cpzConnector";

class ConnectorAPI extends BaseConnectorAPI {
  constructor() {
    super();
    this.createOrder = createOrder;
    this.cancelOrder = cancelOrder;
    this.checkOrder = checkOrder;
  }
}

export default ConnectorAPI;
