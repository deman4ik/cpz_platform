const { getStartedCandlebatchers } = require("../tableStorage");
const executeCandlebatcher = require("./execute");

async function handleTimer(context) {
  try {
    // Считываем все запущенные candlebatcherы
    const getCBsResult = await getStartedCandlebatchers(context);
    if (!getCBsResult.isSuccess) {
      throw getCBsResult;
    }
    const candlebatchers = getCBsResult.data;
    // Параллельно выполняем все задачи
    await Promise.all(
      candlebatchers.map(async state => {
        await executeCandlebatcher(context, state);
      })
    );
  } catch (error) {
    context.log.error(error);
    // TODO: EVENTGRID LOG
  }
}
module.exports = handleTimer;
