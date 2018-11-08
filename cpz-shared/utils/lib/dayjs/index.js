import dayjs from "dayjs";
import UTCPlugin from "./plugin/utc";
/* dayjs в режиме UTC */
dayjs.extend(UTCPlugin);

export default dayjs;
