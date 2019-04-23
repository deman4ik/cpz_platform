import { LOG_ADVISER_LOG_EVENT } from "cpz/events/types/log";

const adviserStateToCommonProps = state => ({
  taskId: state.taskId,
  exchange: state.exchange,
  asset: state.asset,
  currency: state.currency,
  timeframe: state.timeframe,
  robotId: state.robotId,
  strategyName: state.strategyName
});

function createLogEvent(subject, data) {
  let dataToSend;

  if (data instanceof Object) {
    if (Array.isArray(data)) {
      dataToSend = { data };
    } else {
      dataToSend = { ...data };
    }
  } else {
    dataToSend = { data };
  }

  return {
    eventType: LOG_ADVISER_LOG_EVENT,
    eventData: {
      subject,
      data: dataToSend
    }
  };
}

export { adviserStateToCommonProps, createLogEvent };
