declare module "https-proxy-agent" {
  import * as https from "https";

  namespace HttpsProxyAgent {
    interface HttpsProxyAgentOptions {
      [key: string]: any;
    }
  }

  // HttpsProxyAgent doesnt *actually* extend https.Agent, but for my purposes I want it to pretend that it does
  class HttpsProxyAgent extends https.Agent {
    constructor(opts: HttpsProxyAgent.HttpsProxyAgentOptions | string);
  }

  export = HttpsProxyAgent;
}
