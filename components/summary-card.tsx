export function SummaryCard() {
  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Document Summary">
      <h3 className="font-semibold mb-2" style={{ color: "var(--color-brand)" }}>
        Document Summary
      </h3>
      <p className="text-sm leading-relaxed">
        This residential lease outlines the terms between tenant and landlord, including payment schedules, maintenance
        responsibilities, and penalties for late payments. Key obligations include timely rent payment, keeping the
        property in good condition, and seeking approval for subletting.
      </p>
      <div className="mt-3 rounded-md p-3 text-sm" style={{ background: "rgba(59,130,246,0.08)" }}>
        <span className="font-medium">Sample Clause (14):</span> “If you delay rent payment, you must pay ₹500/day
        penalty”
        <div className="mt-2">
          <span className="font-medium">Plain English:</span> Late rent payments cost you ₹500 per day.
        </div>
      </div>
    </div>
  )
}
