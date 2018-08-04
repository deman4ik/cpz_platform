const dev = process.env.NODE_ENV !== "production";
if (dev) require("dotenv-safe").config(); // eslint-disable-line

/* Пример сохранения и считывания секретов в Azure KeyVault */
const setSecret = require("./setSecret");
const getSecret = require("./getSecret");
const createKey = require("./createKey");
const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

const example = async (keyName, secretName, value) => {
  console.log(`Message to store:\n${value}`);
  console.log(`Creating key: "${keyName}" ...`);
  const key = await createKey(keyName);
  console.log(`New key:\n${JSON.stringify(key)}`);
  console.log(`Encrypting message with key...`);
  const encryptResult = await encrypt(value, keyName);
  console.log(`Encryption result:\n${JSON.parse(encryptResult).type}`);
  console.log(`Saving encrypted message to secret "${secretName}" ...`);
  const secret = await setSecret(encryptResult, secretName);
  console.log(`New secret:\n${JSON.stringify(secret)}`);
  console.log(`Reading encrypted message from secret "${secretName}" ...`);
  const secretValue = await getSecret(secretName);
  console.log(`Secret value:\n${JSON.parse(secretValue).type}`);
  console.log(`Decrypting secret value with key...`);
  const decryptResult = await decrypt(secretValue, keyName);
  console.log(`Secret decrypted message:\n${decryptResult}`);
};

example("test2", "test2", `DVoXxpFmqHQfj5EBGQXTkLJrjC0o2OjR9YlQ9L0tvOS`);
