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
 * Разбивка числа по пачкам
 *
 * @param {number} number
 * @param {number} chunkSize
 * @returns {number[]}
 */
function chunkNumberToArray(number: number, chunkSize: number): number[] {
  const array = [...Array(number + 1).keys()].slice(1);
  return chunkArray(array, chunkSize).map(val => val.length);
}

/**
 * Returns all unique values of an array, based on a provided comparator function.
 *
 * @template T
 * @param {T[]} arr
 * @param {(a: T, b: T) => boolean} fn
 * @returns {T[]}
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

/**
 * Find last element where property is max
 *
 * @param {{ [key: string]: any }[]} arr
 * @param {string} propName
 * @returns
 */
function findLastByMaxProp(arr: { [key: string]: any }[], propName: string) {
  return arr
    .filter(
      el =>
        el[propName] ===
        arr.reduce((max, p) => (p[propName] > max ? p[propName] : max), 0)
    )
    .pop();
}

/**
 * Find last element where property is min
 *
 * @param {{ [key: string]: any }[]} arr
 * @param {string} propName
 * @returns
 */
function findLastByMinProp(arr: { [key: string]: any }[], propName: string) {
  return arr
    .filter(
      el =>
        el[propName] ===
        arr.reduce((min, p) => (p[propName] < min ? p[propName] : min), 0)
    )
    .pop();
}

function divideFixed(a: number, b: number): number | 0 {
  if (!a || !b || a === 0 || b === 0) return 0;
  const result = a / b;
  return +result.toFixed(2);
}

export {
  sortAsc,
  sortDesc,
  capitalize,
  arraysDiff,
  chunkArray,
  chunkArrayIncrEnd,
  chunkNumberToArray,
  uniqueElementsBy,
  sleep,
  findLastByMaxProp,
  findLastByMinProp,
  divideFixed
};
