const getClient = require("./client");

const CLIENT_ID = process.env.READ_CLIENT_ID; // service principal
const SECRET = process.env.READ_APPLICATION_SECRET;
const VAULT_URI = process.env.VAULT;

/**
 * Считывание секрета из хранилища
 *
 * @param {string} secretName имя
 * @param {string} secretVersion версия
 * @returns {string}
 */
const getSecret = async (secretName, secretVersion = "") => {
  try {
    const keyVaultClient = await getClient(CLIENT_ID, SECRET);
    const result = await keyVaultClient.getSecret(
      VAULT_URI,
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
