/**
 * Сортировка по возрастанию
 *
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
function sortAsc(a: number, b: number): number {
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
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
function sortDesc(a: number, b: number): number {
  if (a > b) {
    return -1;
  }
  if (b > a) {
    return 1;
  }
  return 0;
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

export { sortAsc, sortDesc, arraysDiff, chunkArray, uniqueElementsBy, sleep };
