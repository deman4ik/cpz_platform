public class ImportInput
{
    public string exchange { get; set; }
    public string exchangeId { get; set; }
    public string baseq { get; set; }
    public string quote { get; set; }
    public string dateFrom { get; set; }
    public string dateTo { get; set; }
    public string timeframe { get; set; }
    public double timeout { get; set; }

    public override string ToString() => $"{exchange}({exchangeId}) - {baseq}/{quote} - {timeframe} - {dateFrom}/{dateTo}";
}

public class ImportOutput
{
    public List<CandlesList> candles { get; set; }

    public string lastDate { get; set; }
    public string timeout { get; set; }
}

public class CandlesList : List<double> { }