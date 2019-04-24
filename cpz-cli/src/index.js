import Vorpal from "vorpal";

import { saveAPIKeys } from "./keyVault";
import { createSubs } from "./eventGrid";
import { createEnvList, updateEnvVars } from "./envvars";

const vorpal = new Vorpal();
vorpal
  .command(
    "kv save api-keys <APIKey> <APISecret>",
    "Encrypt and save Exchange API Keys to Key Vault."
  )
  .option("-u, --user <userId>", "Use userId as name")
  .option("-s, --spare", "Save spare keys.")
  .option(
    "--APIKeyEncrKeyName <APIKeyEncrKeyName>",
    "Encryption key name for API Key."
  )
  .option(
    "--APISecretEncrKeyName <APISecretEncrKeyName>",
    "Encryption key name for API Secret."
  )
  .option(
    "--APIKeySecretName <APIKeySecretName>",
    "Name of secret for API Key."
  )
  .option(
    "--APISecretSecretName <APISecretSecretName>",
    "Name of secret for API Secret."
  )
  .action(saveAPIKeys);

vorpal
  .command("eg create subs <Env> <APIKey>")
  .option("-d, --debug", "Debug mode.")
  .action(createSubs);
vorpal.command("env create list").action(createEnvList);
vorpal.command("env update <Env>").action(updateEnvVars);
vorpal.delimiter("cpz$").show();
