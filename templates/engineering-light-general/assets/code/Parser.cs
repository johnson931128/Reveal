namespace PresentationTemplate.Analysis;

public sealed class Parser
{
    public IReadOnlyList<Record> Parse(string capturePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(capturePath);

        return File.ReadLines(capturePath)
            .Select(ParseLine)
            .ToArray();
    }

    private static Record ParseLine(string line)
    {
        var fields = line.Split(',');
        return new Record(fields[0], fields.Length > 1);
    }
}
