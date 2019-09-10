import urllib from "url";
import fs from "fs";
import path from "path";
import fetch, { RequestInit, RequestInfo } from "node-fetch";
import HttpsProxyAgent, { HttpsProxyAgentOptions } from "https-proxy-agent";

// Luminati Proxy Manager Certificate
const ca = fs.readFileSync(path.resolve(process.cwd(), "vault/ca.crt"));

function createProxyAgent(proxy: string) {
  const proxyHost = urllib.parse(proxy);
  const proxyOptions: HttpsProxyAgentOptions = {
    ...proxyHost,
    host: proxyHost.host,
    port: +proxyHost.port,
    ca
  };

  return new HttpsProxyAgent(proxyOptions);
}

function createFetchMethod(proxy: string) {
  const agent = createProxyAgent(proxy);
  return async function fetchInterface(url: RequestInfo, options: RequestInit) {
    return fetch(url, {
      ...options,
      agent,
      headers: { ...options.headers, Connection: "keep-alive" }
    });
  };
}

export { createProxyAgent, createFetchMethod };
