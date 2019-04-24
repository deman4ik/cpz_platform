import envVars from "cpz/config/environment";
import dotenv from "dotenv-safe";
import fs from "fs";
import { setSecret } from "cpz/keyVault";

dotenv.config();
const {
  KEY_VAULT_URL,
  KEY_VAULT_WRITE_CLIENT_ID,
  KEY_VAULT_WRITE_APP_SECRET
} = process.env;

function loadEnvFile() {
  try {
    const envFile = JSON.parse(fs.readFileSync("envlist.json"));
    console.log("Found envlist.json");
    return envFile;
  } catch (error) {
    console.log("No current env list file");
    return {};
  }
}
function generateEnvVarsList() {
  let envFile = loadEnvFile();

  if (!envFile) envFile = {};

  Object.keys(envVars).forEach(key => {
    if (!envFile[key]) envFile[key] = {};
    envVars[key].variables.forEach(variable => {
      if (!envFile[key][variable]) envFile[key][variable] = "";
    });
    const redundantVars = Object.keys(envFile[key]).filter(
      variable => !envVars[key].variables.includes(variable)
    );
    redundantVars.forEach(variable => {
      delete envFile[key][variable];
    });
  });

  fs.writeFileSync("envlist.json", JSON.stringify(envFile));
}

async function setSecretEnvVars(environment) {
  const envFile = loadEnvFile();
  if (!envFile) {
    console.log("Create envlist.json first", "env create list");
    return;
  }
  const envSetResult = { ...envFile };
  await Promise.all(
    Object.keys(envFile).map(async key => {
      await Promise.all(
        Object.keys(envFile[key]).map(async variable => {
          const secretName = `${key}-${variable}-${environment}`.replace(
            /_/g,
            "-"
          );
          console.log(secretName);
          console.log(envFile[key][variable]);
          await setSecret({
            uri: KEY_VAULT_URL,
            clientId: KEY_VAULT_WRITE_CLIENT_ID,
            appSecret: KEY_VAULT_WRITE_APP_SECRET,
            secretValue: envFile[key][variable],
            secretName
          });
          envSetResult[key][variable] = secretName;
        })
      );
    })
  );

  fs.writeFileSync("envsetresult.json", JSON.stringify(envSetResult));
}

export { generateEnvVarsList, setSecretEnvVars };
