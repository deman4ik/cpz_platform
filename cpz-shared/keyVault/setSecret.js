import KeyVault from "azure-keyvault";
import ServiceError from "../error";
import getClient from "./client";

/**
 * Сохранение секрета в хранилище
 *
 * @param {string} uri Azure Key Vault URI
 * @param {string} clientId Azure Key Vault Client Id (Service principal)
 * @param {string} appSecret Azure Key Vault Application Secret
 * @param {string} secretValue значение
 * @param {string} secretName имя
 * @returns {json} идентификатор
 */
async function setSecret({
  uri,
  clientId,
  appSecret,
  secretValue,
  secretName
}) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);
    const result = await keyVaultClient.setSecret(uri, secretName, secretValue);
    const secretId = KeyVault.parseSecretIdentifier(result.id);
    return secretId;
  } catch (error) {
    throw new ServiceError(
      { name: ServiceError.types.KEY_VAULT_ERROR, cause: error },
      "Failed to set secret"
    );
  }
}

export default setSecret;
