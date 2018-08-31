function createRobotSlug(exchange, baseq, quote, timeframe) {
  return `${exchange}.${baseq}.${quote}.${timeframe}`;
}

module.exports = {
  createRobotSlug
};
