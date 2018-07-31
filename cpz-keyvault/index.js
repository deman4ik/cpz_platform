const dev = process.env.NODE_ENV !== "production";
if (dev) require("dotenv-safe").config(); // eslint-disable-line

/* Пример сохранения и считывания секретов в Azure KeyVault */
const setSecret = require("./setSecret");
const getSecret = require("./getSecret");

const example = async secretName => {
  const newSecretVersion = await setSecret(
    secretName,
    Math.random().toString()
  );
  const value = await getSecret(secretName, newSecretVersion);
  console.log(`Secret Value: ${value}`);
};

example("test2");
