const getClient = require("./client");

const clientId = process.env.READ_CLIENT_ID; // service principal
const secret = process.env.READ_APPLICATION_SECRET;
const vaultUri = process.env.VAULT;

/**
 * Разшифровка сообщения
 *
 * @param {json} value зашифрованное сообщение
 * @param {string} keyName имя ключа
 * @param {string} keyVersion версия ключа
 * @returns {string} расшифрованное сообщение
 */
const decrypt = async (value, keyName, keyVersion = "") => {
  try {
    const keyVaultClient = await getClient(clientId, secret);

    const result = await keyVaultClient.decrypt(
      vaultUri,
      keyName,
      keyVersion,
      "RSA-OAEP",
      Buffer.from(JSON.parse(value).data)
    );

    return result.result;
  } catch (err) {
    console.log(err);
    return new Error(`Can't decrypt value\n${err}`);
  }
};

module.exports = decrypt;
