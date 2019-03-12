/**
 * Проверить есть ли значение из объекта по пути
 *
 * @param {*} obj объект у которого будем искать
 * @param {*} str путь по которому будем искать
 * @example hasQueryByPath([1, [{b: 3}]], "[1][0].b") результат - true
 * @example hasQueryByPath([1], "a") результат - false
 * @returns {Boolean} есть ли такое свойство
 */
const hasQueryByPath = (obj, str) => {
  if (typeof obj !== "object") return false;

  const path = str
    .replace(/\[([^[\]]*)\]/g, ".$1.")
    .split(".")
    .filter(key => key !== "");

  // Small saving
  let prev = obj;
  for (let i = 0; i < path.length; i += 1) {
    const cur = path[i];

    if (typeof prev !== "object") return false;
    if (cur in prev) prev = prev[cur];
    else return false;
  }

  return true;
};

export { hasQueryByPath };
