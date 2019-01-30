import VError from "verror";
import HttpsProxyAgent from "https-proxy-agent";
import { getSecret, decrypt } from "cpzKeyVault";

const {
  KEY_VAULT_URL,
  KEY_VAULT_READ_CLIENT_ID,
  KEY_VAULT_READ_APP_SECRET,
  KEY_VAULT_DECR_CLIENT_ID,
  KEY_VAULT_DECR_APP_SECRET
} = process.env;
class BasePrivateProvider {
  constructor(input) {
    this._exchange = input.exchange;
    this._exchangeName = this._exchange.toLowerCase();
    this._userId = input.userId;
    this._keys = {
      main: {
        encryptionKeyName: null,
        APIKeyVersion: null,
        APISecretVersion: null
      },
      spare: {
        encryptionKeyName: null,
        APIKeyVersion: null,
        APISecretVersion: null
      }
    };
    this._keys = { ...this._keys, ...input.keys };
    this._exchange = input.exchange;
    this._currentKeyType = "main";
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  async _loadKeys(context, keyType) {
    try {
      const encryptedAPIKey = await getSecret({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_READ_CLIENT_ID,
        appSecret: KEY_VAULT_READ_APP_SECRET,
        secretName: `${this._exchangeName}-${this._userId}-${keyType}-key`,
        secretVersion: this._keys[keyType].APIKeyVersion
      });

      const encryptedAPISecret = await getSecret({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_READ_CLIENT_ID,
        appSecret: KEY_VAULT_READ_APP_SECRET,
        secretName: `${this._exchangeName}-${this._userId}-${keyType}-secret`,
        secretVersion: this._keys[keyType].APISecretVersion
      });

      this._keys[keyType].APIKey = await decrypt({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_DECR_CLIENT_ID,
        appSecret: KEY_VAULT_DECR_APP_SECRET,
        value: encryptedAPIKey,
        keyName: this._keys[keyType].encryptionKeyName
      });
      this._keys[keyType].APISecret = await decrypt({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_DECR_CLIENT_ID,
        appSecret: KEY_VAULT_DECR_APP_SECRET,
        value: encryptedAPISecret,
        keyName: this._keys[keyType].encryptionKeyName
      });
    } catch (error) {
      throw new VError(
        {
          name: "LoadAPIKeysError",
          cause: error,
          info: {
            keyType,
            encryptionKeyName: this._keys[keyType].encryptionKeyName,
            APIKeyVersion: this._keys[keyType].APIKeyVersion,
            APISecretVersion: this._keys[keyType].APISecretVersion
          }
        },
        "Failed to load API Keys."
      );
    }
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
