function currentToObject(value) {
  // {Type}~{ExchangeName}~{FromCurrency}~{ToCurrency}~{Flag}~{Price}~{LastUpdate}~{LastVolume}~{LastVolumeTo}~{LastTradeId}~{Volume24h}~{Volume24hTo}~{MaskInt}
  const valuesArray = value.split("~");
  const getDirection = dir => {
    switch (dir) {
      case "1":
        return "up";
      case "2":
        return "down";
      case "4":
        return "unchanged";
      default:
        return "unknown";
    }
  };

  const type = valuesArray[0];
  if (type === "2") {
    const mask = valuesArray[valuesArray.length - 1].toString().slice(-1);
    if (mask === "9") {
      const obj = {
        exchange: valuesArray[1],
        asset: valuesArray[2],
        currency: valuesArray[3],
        direction: getDirection(valuesArray[4]),
        price: parseFloat(valuesArray[5]),
        lastUpdate: new Date(parseInt(valuesArray[6], 10) * 1000).toISOString(),
        lastVolume: parseFloat(valuesArray[8]),
        lastTradeId: valuesArray[9],
        volume24h: parseFloat(valuesArray[11])
      };
      return obj;
    }
  }
  return null;
}

export { currentToObject };
