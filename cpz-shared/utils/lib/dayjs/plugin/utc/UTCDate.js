/* 
 * Plugin for dayjs 
 * https://github.com/iamkun/dayjs/pull/168
 */

const { LOCAL_TIMEZONE_OFFSET } = require("./util");

const padStart = (string, length, pad) => {
  const s = String(string);
  if (!s || s.length >= length) return string;
  return `${Array(length + 1 - s.length).join(pad)}${string}`;
};

const padZoneStr = negMinuts => {
  const minutes = Math.abs(negMinuts);
  const hourOffset = Math.floor(minutes / 60);
  const minuteOffset = minutes % 60;
  return `${negMinuts <= 0 ? "+" : "-"}${padStart(
    hourOffset,
    2,
    "0"
  )}:${padStart(minuteOffset, 2, "0")}`;
};
const datePrototype = Date.prototype;
function getTimestampOffset(
  timezoneOffset,
  pastTimezoneOffset = LOCAL_TIMEZONE_OFFSET
) {
  return (timezoneOffset - pastTimezoneOffset) * 60000;
}
class UTCDate {
  constructor(arg = new Date(), $timezoneOffset = arg.getTimezoneOffset()) {
    this.$d = new Date(arg.getTime() - getTimestampOffset($timezoneOffset));
    this.$timezoneOffset = $timezoneOffset;
  }

  getTimezoneOffset() {
    return this.$timezoneOffset;
  }

  setTimezoneOffset($timezoneOffset = this.$timezoneOffset) {
    this.$d.setTime(
      this.$d.getTime() +
        getTimestampOffset(this.$timezoneOffset, $timezoneOffset)
    );
    this.$timezoneOffset = $timezoneOffset;
  }
}
[
  "toDateString",
  "toLocaleString",
  "toLocaleDateString",
  "toLocaleTimeString",
  "setDate",
  "setFullYear",
  "setHours",
  "setMilliseconds",
  "setMinutes",
  "setMonth",
  "setSeconds",
  "setTime",
  "setYear",
  "getDate",
  "getDay",
  "getFullYear",
  "getHours",
  "getMilliseconds",
  "getMinutes",
  "getMonth",
  "getSeconds",
  "getYear"
].forEach(key => {
  UTCDate.prototype[key] = function() {
    // eslint-disable-next-line prefer-rest-params
    return datePrototype[key].apply(this.$d, arguments);
  };
});
[
  "toISOString",
  "toUTCString",
  "toGMTString",
  "toJSON",
  "getUTCDate",
  "getUTCDay",
  "getUTCFullYear",
  "getUTCHours",
  "getUTCMilliseconds",
  "getUTCMinutes",
  "getUTCMonth",
  "getUTCSeconds",
  "valueOf",
  "getTime"
].forEach(key => {
  UTCDate.prototype[key] = function() {
    return datePrototype[key].apply(
      new Date(this.$d.getTime() + getTimestampOffset(this.$timezoneOffset)),
      arguments // eslint-disable-line prefer-rest-params
    );
  };
});
[
  "setUTCDate",
  "setUTCFullYear",
  "setUTCHours",
  "setUTCMilliseconds",
  "setUTCMinutes",
  "setUTCMonth",
  "setUTCSeconds"
].forEach(key => {
  UTCDate.prototype[key] = function() {
    const tmp = new Date(
      this.$d.getTime() + getTimestampOffset(this.$timezoneOffset)
    );
    // eslint-disable-next-line prefer-rest-params
    datePrototype[key].apply(tmp, arguments);
    tmp.setTime(tmp.getTime() - getTimestampOffset(this.$timezoneOffset));
    this.$d = tmp;
  };
});
["toString", "toTimeString"].forEach(key => {
  UTCDate.prototype[key] = function() {
    // eslint-disable-next-line prefer-rest-params
    return datePrototype[key]
      .apply(this.$d, arguments)
      .replace(/GMT(.*)$/, `GMT${padZoneStr(this.$timezoneOffset)}`);
  };
});
module.exports = UTCDate;
