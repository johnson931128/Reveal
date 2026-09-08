namespace PresentationTemplate.Analysis;

public sealed record Record(string Name, bool IsValid);

public sealed record AnalysisResult(
    int RecordCount,
    int ErrorCount)
{
    public bool IsSuccessful => ErrorCount == 0;
}
