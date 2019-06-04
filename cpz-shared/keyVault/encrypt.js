import ServiceError from "../error";
import getClient from "./client";

/**
 * Шифрование сообщения
 *
 * @param {string} uri Azure Key Vault URI
 * @param {string} clientId Azure Key Vault Client Id (Service principal)
 * @param {string} appSecret Azure Key Vault Application Secret
 * @param {string} value сообщение
 * @param {string} keyName имя ключа
 * @param {string} keyVersion версия ключа
 * @returns {json} зашифрованное сообщение
 */
async function encrypt({
  uri,
  clientId,
  appSecret,
  value,
  keyName,
  keyVersion = ""
}) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);

    const result = await keyVaultClient.encrypt(
      uri,
      keyName,
      keyVersion,
      "RSA-OAEP",
      Buffer.from(value)
    );

    return JSON.stringify(result.result);
  } catch (error) {
    throw new ServiceError(
      { name: ServiceError.types.KEY_VAULT_ERROR, cause: error },
      "Failed to encrypt value"
    );
  }
}

export default encrypt;
