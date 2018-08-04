const getClient = require("./client");

const CLIENT_ID = process.env.READ_CLIENT_ID; // service principal
const SECRET = process.env.READ_APPLICATION_SECRET;
const VAULT_URI = process.env.VAULT;

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
    const keyVaultClient = await getClient(CLIENT_ID, SECRET);

    const result = await keyVaultClient.decrypt(
      VAULT_URI,
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
