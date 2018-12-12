/*
 * Plugin for dayjs
 * https://github.com/iamkun/dayjs/pull/168
 */

function parseTimezoneOffset(tz) {
  let execRet;
  switch (typeof tz) {
    case "string":
      if (/Z$/.test(tz)) return 0;
      execRet = /([+-])(\d{2}):?(\d{2})/.exec(tz);
      return (
        execRet &&
        (+execRet[3] + execRet[2] * 60) * (execRet[1] === "+" ? 1 : -1)
      );
    case "number":
      if (Number.isNaN(tz)) return null;
      return Math.abs(tz) < 16 ? tz * 60 : tz;
    default:
      return null;
  }
}
const LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset();

export { parseTimezoneOffset, LOCAL_TIMEZONE_OFFSET };
