import Vorpal from "vorpal";

import { saveAPIKeys } from "./keyVault";
import { createSubs } from "./eventGrid";

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

vorpal.command("eg create subs <Env>").action(createSubs);
vorpal.delimiter("cpz$").show();
