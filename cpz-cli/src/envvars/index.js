import { generateEnvVarsList, setSecretEnvVars } from "./utils";

async function createEnvList(args) {
  this.log("createEnvList", args);
  generateEnvVarsList();
}

async function updateEnvVars(args) {
  this.log("updateEnvVars", args);
  await setSecretEnvVars(args.Env);
}

export { createEnvList, updateEnvVars };
