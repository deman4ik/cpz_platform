import VError from "verror";
import HttpsProxyAgent from "https-proxy-agent";
import { getSecret, decrypt } from "cpzKeyVault";

const {
  KEY_VAULT_URL,
  KEY_VAULT_READ_CLIENT_ID,
  KEY_VAULT_READ_APP_SECRET
} = process.env;
class BasePrivateProvider {
  constructor(input) {
    this._userId = input.userId;
    this._encryptionKeyName = input.encryptionKeyName;
    this._exchange = input.exchange;
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  async loadKeys() {
    const encryptedApiKeyMain = await getSecret({
      uri: KEY_VAULT_URL,
      clientId: KEY_VAULT_READ_CLIENT_ID,
      appSecret: KEY_VAULT_READ_APP_SECRET,
      secretName: `${this._exchange}_${this._userId}_KEY_MAIN`
    });
    const encryptedApiSecretMain = await getSecret({
      uri: KEY_VAULT_URL,
      clientId: KEY_VAULT_READ_CLIENT_ID,
      appSecret: KEY_VAULT_READ_APP_SECRET,
      secretName: `${this._exchange}_${this._userId}_SECRET_MAIN`
    });
    this.API_KEY_MAIN = await decrypt({
      uri: KEY_VAULT_URL,
      clientId: KEY_VAULT_READ_CLIENT_ID,
      appSecret: KEY_VAULT_READ_APP_SECRET,
      value: encryptedApiKeyMain,
      keyName: this._encryptionKeyName
    });
    this.API_SECRET_MAIN = await decrypt({
      uri: KEY_VAULT_URL,
      clientId: KEY_VAULT_READ_CLIENT_ID,
      appSecret: KEY_VAULT_READ_APP_SECRET,
      value: encryptedApiSecretMain,
      keyName: this._encryptionKeyName
    });
    // TODO: Add Spare keys pare
  }

  async getBalance() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async createOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async checkOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'checkOrder' not impemented in this Provider"
    );
  }

  async cancelOrder() {
    throw new VError(
      { name: "NotImlementedError" },
      "Method 'cancelOrder' not impemented in this Provider"
    );
  }
}

export default BasePrivateProvider;
