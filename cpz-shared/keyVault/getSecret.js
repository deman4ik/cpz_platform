import VError from "verror";
import getClient from "./client";

/**
 * Считывание секрета из хранилища
 *
 * @param {string} uri Azure Key Vault URI
 * @param {string} clientId Azure Key Vault Client Id (Service principal)
 * @param {string} appSecret Azure Key Vault Application Secret
 * @param {string} secretName имя
 * @param {string} secretVersion версия
 * @returns {string}
 */
async function getSecret({
  uri,
  clientId,
  appSecret,
  secretName,
  secretVersion = ""
}) {
  try {
    const keyVaultClient = getClient(clientId, appSecret);
    const result = await keyVaultClient.getSecret(
      uri,
      secretName,
      secretVersion
    );
    return result.value;
  } catch (error) {
    throw new VError(
      { name: "KeyVaultError", cause: error },
      "Failed to read secret"
    );
  }
}

export default getSecret;
