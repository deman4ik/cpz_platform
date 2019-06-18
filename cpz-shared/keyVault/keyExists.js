import ServiceError from "../error";
import getClient from "./client";

/**
 * Создание нового ключа
 *
 * @param {string} uri Azure Key Vault URI
 * @param {string} clientId Azure Key Vault Client Id (Service principal)
 * @param {string} appSecret Azure Key Vault Application Secret
 * @param {string} keyName имя
 * @returns {string} версия
 */
async function keyExists({ uri, clientId, appSecret, keyName }) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);

    await keyVaultClient.getKey(uri, keyName, "");
    return true;
  } catch (error) {
    if (error.message.includes("Key not found")) return false;
    throw new ServiceError(
      { name: ServiceError.types.KEY_VAULT_ERROR, cause: error },
      "Failed to create new key"
    );
  }
}

export default keyExists;
