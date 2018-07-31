const getClient = require("./client");

const clientId = process.env.READ_CLIENT_ID; // service principal
const secret = process.env.READ_APPLICATION_SECRET;
const vaultUri = process.env.VAULT;

/**
 * Считывание секрета из хранилища
 *
 * @param {string} secretName имя
 * @param {string} secretVersion версия
 * @returns {string}
 */
const getSecret = async (secretName, secretVersion) => {
  try {
    const keyVaultClient = await getClient(clientId, secret);
    const result = await keyVaultClient.getSecret(
      vaultUri,
      secretName,
      secretVersion
    );
    return result.value;
  } catch (err) {
    console.log(err);
    return new Error(`Can't read secret\n${err}`);
  }
};

module.exports = getSecret;
