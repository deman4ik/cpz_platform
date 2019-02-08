/**
 * Checks required environment variables
 *
 * @param {[string]} list
 */
function checkEnvVars(list) {
  if (!list || !Array.isArray(list) || list.length === 0) return;
  const missingVars = list.filter(variable => !process.env[variable]);
  if (missingVars.length > 0) {
    throw new Error(
      `Environment variables: ${missingVars.join(", ")} required!`
    );
  }
}

export { checkEnvVars };
