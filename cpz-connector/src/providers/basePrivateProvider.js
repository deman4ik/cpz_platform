import ServiceError from "cpz/error";
import Log from "cpz/log";
import HttpsProxyAgent from "https-proxy-agent";
import { getSecret, decrypt } from "cpz/keyVault";

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

  async _loadAndDecrypt(keyType, keyName) {
    try {
      Log.debug("loadAndDecrypt()");
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
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_LOAD_DECR_SECR_ERROR,
          cause: e,
          info: {
            keyType,
            keyName
          }
        },
        "Failed to load and decrypt secret from key vault."
      );
    }
  }

  async _loadKeys(keyType) {
    try {
      Log.debug("loadKeys()");

      const loaders = [
        this._loadAndDecrypt(keyType, "APIKey"),
        this._loadAndDecrypt(keyType, "APISecret")
      ];

      await Promise.all(loaders);
    } catch (e) {
      throw new ServiceError(
        {
          name: ServiceError.types.CONNECTOR_LOAD_API_KEYS_ERROR,
          cause: e,
          info: {
            keyType
          }
        },
        "Failed to load API Keys."
      );
    }
  }

  async getBalance() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async createOrder() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'createOrder' not impemented in this Provider"
    );
  }

  async checkOrder() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'checkOrder' not impemented in this Provider"
    );
  }

  async cancelOrder() {
    throw new ServiceError(
      { name: ServiceError.types.NOT_IMPLEMENTED_ERROR },
      "Method 'cancelOrder' not impemented in this Provider"
    );
  }
}

export default BasePrivateProvider;
