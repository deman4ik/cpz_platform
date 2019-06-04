import KeyVault from "azure-keyvault";
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
async function createKey({ uri, clientId, appSecret, keyName }) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);

    const keyOperations = ["encrypt", "decrypt"];
    const keyOptions = {
      keySize: 4096,
      keyOps: keyOperations
    };

    const result = await keyVaultClient.createKey(
      uri,
      keyName,
      "RSA",
      keyOptions
    );

    const keyId = KeyVault.parseKeyIdentifier(result.key.kid);
    return keyId;
  } catch (error) {
    throw new ServiceError(
      { name: ServiceError.types.KEY_VAULT_ERROR, cause: error },
      "Failed to create new key"
    );
  }
}

export default createKey;
