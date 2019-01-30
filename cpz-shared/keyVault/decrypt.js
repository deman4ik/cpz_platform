import VError from "verror";
import getClient from "./client";

/**
 * Разшифровка сообщения
 *
 * @param {string} uri Azure Key Vault URI
 * @param {string} clientId Azure Key Vault Client Id (Service principal)
 * @param {string} appSecret Azure Key Vault Application Secret
 * @param {json} value зашифрованное сообщение
 * @param {string} keyName имя ключа
 * @param {string} keyVersion версия ключа
 * @returns {string} расшифрованное сообщение
 */
async function decrypt({
  uri,
  clientId,
  appSecret,
  value,
  keyName,
  keyVersion = ""
}) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);

    const result = await keyVaultClient.decrypt(
      uri,
      keyName,
      keyVersion,
      "RSA-OAEP",
      Buffer.from(JSON.parse(value).data)
    );

    return result.result.toString("utf8");
  } catch (error) {
    throw new VError(
      { name: "KeyVaultError", cause: error },
      "Failed to decrypt value"
    );
  }
}

export default decrypt;
