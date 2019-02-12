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
        specified: false,
        loaded: false,
        active: true,
        APIKey: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        },
        APISecret: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        }
      },
      spare: {
        specified: false,
        loaded: false,
        active: false,
        APIKey: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        },
        APISecret: {
          encryptionKeyName: null,
          name: null,
          version: null,
          value: null
        }
      }
    };
    this._setKeys(input.keys);
    this._exchange = input.exchange;
    this._currentKeyType = "main";
    this._proxy = input.proxy || process.env.PROXY_ENDPOINT;
    if (this._proxy) this._proxyAgent = new HttpsProxyAgent(this._proxy);
  }

  _setKeys(keys) {
    if (keys.main) {
      this._keys.main.APIKey = keys.main.APIKey;
      this._keys.main.APISecret = keys.main.APISecret;
      this._keys.main.specified = true;
      this._keys.main.loaded = !!(
        keys.main.APIKey.value && keys.main.APISecret.value
      );
    }

    if (keys.spare) {
      this._keys.spare.APIKey = keys.spare.APIKey;
      this._keys.spare.APISecret = keys.spare.APISecret;
      this._keys.spare.specified = true;
      this._keys.spare.loaded = !!(
        keys.spare.APIKey.value && keys.spare.APISecret.value
      );
    }
  }

  async _loadAndDecrypt(context, keyType, keyName) {
    try {
      context.log("loadAndDecrypt()");
      const encryptedData = await getSecret({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_READ_CLIENT_ID,
        appSecret: KEY_VAULT_READ_APP_SECRET,
        secretName: this._keys[keyType][keyName].name,
        secretVersion: this._keys[keyType][keyName].version
      });
      this._keys[keyType][keyName].value = await decrypt({
        uri: KEY_VAULT_URL,
        clientId: KEY_VAULT_DECR_CLIENT_ID,
        appSecret: KEY_VAULT_DECR_APP_SECRET,
        value: encryptedData,
        keyName: this._keys[keyType][keyName].encryptionKeyName
      });
      this._keys[keyType][keyName].loaded = true;
    } catch (error) {
      throw new VError(
        {
          name: "LoadAndDecryptSecretError",
          cause: error,
          info: {
            keyType,
            keyName
          }
        },
        "Failed to load and decrypt secret from key vault."
      );
    }
  }

  async _loadKeys(context, keyType) {
    try {
      context.log("loadKeys()");

      const loaders = [
        this._loadAndDecrypt(context, keyType, "APIKey"),
        this._loadAndDecrypt(context, keyType, "APISecret")
      ];

      await Promise.all(loaders);
    } catch (error) {
      throw new VError(
        {
          name: "LoadAPIKeysError",
          cause: error,
          info: {
            keyType
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
