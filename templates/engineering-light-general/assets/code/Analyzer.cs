namespace PresentationTemplate.Analysis;

public sealed class Analyzer
{
    private readonly Parser parser;

    public Analyzer(Parser parser)
    {
        this.parser = parser;
    }

    public AnalysisResult Analyze(string capturePath)
    {
        var records = parser.Parse(capturePath);

        return new AnalysisResult(
            RecordCount: records.Count,
            ErrorCount: records.Count(record => !record.IsValid));
    }
}
