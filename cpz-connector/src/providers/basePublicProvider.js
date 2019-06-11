import ServiceError from "cpz/error";
import createFetchMethod from "../utils/fetch";

class BasePublicProvider {
  constructor(input) {
    this._exchange = input.exchange;
    this._fetch = createFetchMethod(
      input.proxy || process.env.PROXY_ENDPOINT_PUBLIC
    );
  }

  async getMarket() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'getMarket' not impemented in this Provider"
    );
  }

  async loadPreviousCandle() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'loadPreviousCandle' not impemented in this Provider"
    );
  }

  async loadCandles() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'loadCandles' not impemented in this Provider"
    );
  }

  async loadTrades() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'loadTrades' not impemented in this Provider"
    );
  }
}

export default BasePublicProvider;
