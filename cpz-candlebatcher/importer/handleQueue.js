const { getImporterByKey } = require("../tableStorage");
const { execute } = require("../importer/execute");

async function handleQueue(context, keys) {
  const getImporterResult = await getImporterByKey(context, keys);
  if (!getImporterResult.isSuccess) {
    throw getImporterResult;
  }
  const importerState = getImporterResult.data;
  await execute(context, importerState);
}

module.exports = handleQueue;
