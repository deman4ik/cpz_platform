const traderStateToCommonProps = state => ({
  taskId: state.taskId,
  robotId: state.robotId,
  userId: state.userId,
  exchange: state.exchange,
  asset: state.asset,
  currency: state.currency,
  timeframe: state.timeframe
});

export { traderStateToCommonProps };
