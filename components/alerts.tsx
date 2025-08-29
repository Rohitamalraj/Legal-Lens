import { AlertTriangle, ShieldAlert } from "lucide-react"

export function SmartAlerts() {
  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Smart Alerts">
      <h3 className="font-semibold mb-2" style={{ color: "var(--color-brand)" }}>
        Smart Alerts
      </h3>
      <div className="space-y-2">
        <div
          className="flex items-start gap-2 rounded-md border p-3"
          style={{ borderColor: "rgba(239,68,68,0.35)" }}
          role="alert"
        >
          <AlertTriangle size={18} color={"#ef4444"} className="mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Red Flag: High Late Fee</p>
            <p className="text-sm text-gray-700">Late rent incurs ₹500/day. Consider negotiating a cap.</p>
          </div>
        </div>
        <div
          className="flex items-start gap-2 rounded-md border p-3"
          style={{ borderColor: "rgba(245,158,11,0.35)" }}
          role="status"
        >
          <ShieldAlert size={18} color={"#f59e0b"} className="mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Notice: Early Termination Fee</p>
            <p className="text-sm text-gray-700">Breaking the lease early may cost one month’s rent.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
