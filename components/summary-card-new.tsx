interface SummaryCardProps {
  summary?: string;
  keyTerms?: string[];
  filename?: string;
}

export function SummaryCard({ summary, keyTerms, filename }: SummaryCardProps) {
  const defaultSummary = "Upload a document to see its analysis and summary here. Legal Lens will break down complex legal language into plain English.";
  
  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Document Summary">
      <h3 className="font-semibold mb-2" style={{ color: "var(--color-brand)" }}>
        Document Summary{filename && ` - ${filename}`}
      </h3>
      <p className="text-sm leading-relaxed">
        {summary || defaultSummary}
      </p>
      {keyTerms && keyTerms.length > 0 && (
        <div className="mt-3 rounded-md p-3 text-sm" style={{ background: "rgba(59,130,246,0.08)" }}>
          <span className="font-medium">Key Terms:</span>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {keyTerms.slice(0, 3).map((term, index) => (
              <li key={index} className="text-sm">{term}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
