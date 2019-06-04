import ServiceError from "cpz/error";
import Log from "cpz/log";
import { checkAPIKeysEX } from "cpz/connector-client/balance";
import { createKey, encrypt, setSecret } from "cpz/keyVault";
import { saveUserExchaccDB } from "cpz/db-client/userExchacc";
import { capitalize } from "cpz/utils/helpers";

const {
  KEY_VAULT_URL,
  KEY_VAULT_WRITE_CLIENT_ID,
  KEY_VAULT_WRITE_APP_SECRET
} = process.env;

async function saveKeys({
  type = "main",
  APIKey,
  APISecret,
  exchange,
  userId
}) {
  const key = {
    APIKey: { encryptionKeyName: userId },
    APISecret: { encryptionKeyName: userId }
  };

  const encryptedKey = await encrypt({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    value: APIKey,
    keyName: userId
  });
  const encryptedSecret = await encrypt({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    value: APISecret,
    keyName: userId
  });

  key.APIKey.name = `${exchange}-${userId}-${type}-key`;
  const { version: APIKeyVersion } = await setSecret({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    secretValue: encryptedKey,
    secretName: key.APIKey.name
  });
  key.APIKey.version = APIKeyVersion;

  key.APISecret.name = `${exchange}-${userId}-${type}-secret`;
  const { version: APISecretVersion } = await setSecret({
    uri: KEY_VAULT_URL,
    clientId: KEY_VAULT_WRITE_CLIENT_ID,
    appSecret: KEY_VAULT_WRITE_APP_SECRET,
    secretValue: encryptedSecret,
    secretName: key.APISecret.name
  });
  key.APISecret.version = APISecretVersion;
  return key;
}

async function insertExchangeAccount(_, { params }) {
  try {
    const {
      userId,
      exchange,
      name,
      keys: { main, spare }
    } = params;

    // Checking main API Key

    const mainValid = await checkAPIKeysEX({
      userId,
      exchange,
      APIKeyValue: main.APIKey,
      APISecretValue: main.APISecret
    });

    if (!mainValid)
      return {
        success: false,
        error: {
          name: ServiceError.types.CONNECTOR_EXCHANGE_ERROR,
          message: "Main API Key is not valid"
        }
      };

    if (spare) {
      const spareValid = await checkAPIKeysEX({
        userId,
        exchange,
        APIKeyValue: spare.APIKey,
        APISecretValue: spare.APISecret
      });

      if (!spareValid)
        return {
          success: false,
          error: {
            name: ServiceError.types.CONNECTOR_EXCHANGE_ERROR,
            message: "Spare API Key is not valid"
          }
        };
    }

    await createKey({
      uri: KEY_VAULT_URL,
      clientId: KEY_VAULT_WRITE_CLIENT_ID,
      appSecret: KEY_VAULT_WRITE_APP_SECRET,
      keyName: userId
    });

    const keysToSave = {};
    keysToSave.main = await saveKeys({
      type: "main",
      APIKey: main.APIKey,
      APISecret: main.APISecret,
      exchange,
      userId
    });

    if (spare) {
      keysToSave.spare = await saveKeys({
        type: "spare",
        APIKey: spare.APIKey,
        APISecret: spare.APISecret,
        exchange,
        userId
      });
    }

    await saveUserExchaccDB({
      name: name || capitalize(exchange),
      exchange,
      userId,
      keys: keysToSave
    });
    Log.clearContext();
    return {
      success: true
    };
  } catch (e) {
    Log.clearContext();
    const error =
      e instanceof ServiceError
        ? e
        : new ServiceError(
            { name: ServiceError.types.API_ERROR, cause: e },
            "Failed to insert exchange account."
          );
    return {
      success: false,
      error: error.json
    };
  }
}

async function updateExchangeAccount(_, { params }) {
  try {
    // TODO: !!!
    Log.clearContext();
    return {
      success: true
    };
  } catch (e) {
    Log.clearContext();
    const error =
      e instanceof ServiceError
        ? e
        : new ServiceError(
            { name: ServiceError.types.API_ERROR, cause: e },
            "Failed to update exchange account."
          );
    return {
      success: false,
      error: error.json
    };
  }
}

async function deleteExchangeAccount(_, { params }) {
  try {
    // TODO: !!!
    Log.clearContext();
    return {
      success: true
    };
  } catch (e) {
    Log.clearContext();
    const error =
      e instanceof ServiceError
        ? e
        : new ServiceError(
            { name: ServiceError.types.API_ERROR, cause: e },
            "Failed to delete exchange account."
          );
    return {
      success: false,
      error: error.json
    };
  }
}

export { insertExchangeAccount, updateExchangeAccount, deleteExchangeAccount };
