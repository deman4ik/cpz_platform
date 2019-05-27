import urllib from "url";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import HttpsProxyAgent from "https-proxy-agent";

const cert = fs.readFileSync(path.resolve(process.cwd(), "ca.crt"));

function createFetchMethod(proxy) {
  const proxyOptions = urllib.parse(proxy);
  proxyOptions.ca = cert;
  const agent = new HttpsProxyAgent(proxyOptions);
  return async function fetchInterface(url, options) {
    return fetch(url, Object.assign({}, options, { agent }));
  };
}

export default createFetchMethod;
