const candlebatcherStateToCommonProps = state => ({
  taskId: state.taskId,
  exchange: state.exchange,
  asset: state.asset,
  currency: state.currency,
  timeframes: state.timeframes
});

export { candlebatcherStateToCommonProps };
