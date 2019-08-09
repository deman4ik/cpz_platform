/**
 * Сортировка по возрастанию
 *
 * @param {T} a
 * @param {T} b
 * @returns {Number}
 */
function sortAsc<T>(a: T, b: T): number {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }
  return 0;
}

/**
 * Сортировка по убыванию
 *
 * @param {T} a
 * @param {T} b
 * @returns {Number}
 */
function sortDesc<T>(a: T, b: T): number {
  if (a > b) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
}

/**
 * Возвращает исходную строку с прописным первым символом
 *
 * @param {string} string исходная строка
 */
function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Сравнение двух массивов
 *
 * @param {Array} full
 * @param {Array} part
 */
function arraysDiff<T>(full: T[], part: T[]): T[] {
  return full.filter(v => !part.includes(v));
}

/**
 * Разделение массива по пачкам
 * @example chunkArray([1,2,3,4,5,6],2) -> [[1,2],[3,4],[5,6]]
 * @param {Array} array
 * @param {number} chunkSize размер пачкм
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const arrayToChunk = [...array];
  const results = [];
  while (arrayToChunk.length) {
    results.push(arrayToChunk.splice(0, chunkSize));
  }
  return results;
}

/**
 * Разделение массива по пачкам инкрементально с конца
 * @example chunkArrayIncrEnd([1,2,3,4,5,6],2) -> [[1,2],[2,3],[3,4],[4,5],[5,6]]
 *
 * @param {Array} array
 * @param {number} chunkSize размер пачкм
 */
function chunkArrayIncrEnd<T>(array: T[], chunkSize: number): T[][] {
  const arrayToChunk = [...array];
  const results = [];
  let start = arrayToChunk.length - chunkSize;
  let end = arrayToChunk.length;
  while (start >= 0) {
    results.push(arrayToChunk.slice(start, end));
    start -= 1;
    end -= 1;
  }
  return results.reverse();
}

/**
 * Returns all unique values of an array, based on a provided comparator function.
 *
 * @param arr
 * @param fn
 */
function uniqueElementsBy<T>(arr: T[], fn: (a: T, b: T) => boolean): T[] {
  return arr.reduce((acc, v) => {
    if (!acc.some(x => fn(v, x))) acc.push(v);
    return acc;
  }, []);
}

/**
 * Sleep
 *
 * @param ms miliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export {
  sortAsc,
  sortDesc,
  capitalize,
  arraysDiff,
  chunkArray,
  chunkArrayIncrEnd,
  uniqueElementsBy,
  sleep
};
