export function ComparisonView() {
  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Document Comparison">
      <h3 className="font-semibold mb-3" style={{ color: "var(--color-brand)" }}>
        Document Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border p-3" style={{ borderColor: "rgba(55,65,81,0.15)" }}>
          <h4 className="font-semibold mb-2">Document A</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Late fee: ₹500/day</li>
            <li>Termination: 1 month’s rent</li>
            <li>Repairs within 7 days</li>
          </ul>
        </div>
        <div className="rounded-md border p-3" style={{ borderColor: "rgba(55,65,81,0.15)" }}>
          <h4 className="font-semibold mb-2">Document B</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Late fee: ₹300/day</li>
            <li>Termination: Fixed ₹10,000</li>
            <li>Repairs within 3 days</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
