namespace CPZMarketWatcher.Models
{
    /// <summary>
    /// типы событий, приходящих из EventGrid
    /// </summary>
    public static class EventGridEventTypes
    {
        public const string SubscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";

        public const string Start = "CPZ.Tasks.MarketWatcher.Start";

        public const string Subscribe = "CPZ.Tasks.MarketWatcher.Subscribe";

        public const string Unsubscribe = "CPZ.Tasks.MarketWatcher.Unsubscribe";

        public const string Stop = "CPZ.Tasks.MarketWatcher.Stop";
    }
}
