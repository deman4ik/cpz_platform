import urllib from "url";
import fs from "fs";
import path from "path";
import fetch, { RequestInit, RequestInfo } from "node-fetch";
import HttpsProxyAgent, { HttpsProxyAgentOptions } from "https-proxy-agent";

// Luminati Proxy Manager Certificate
const ca = fs.readFileSync(path.resolve(process.cwd(), "vault/ca.crt"));

function createFetchMethod(proxy: string) {
  const proxyHost = urllib.parse(proxy);
  const proxyOptions: HttpsProxyAgentOptions = {
    ...proxyHost,
    ca
  };

  const agent = new HttpsProxyAgent(proxyOptions);
  return async function fetchInterface(url: RequestInfo, options: RequestInit) {
    return fetch(url, {
      ...options,
      agent,
      headers: { ...options.headers, Connection: "keep-alive" }
    });
  };
}

export { createFetchMethod };
