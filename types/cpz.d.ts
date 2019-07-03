export namespace cpz {
  type ExchangeName = "bitfinex" | "kraken";
  interface AssetCred {
    exchange: ExchangeName;
    asset: string;
    currency: string;
  }
}
