"use client"

import * as React from "react"

type DocumentSummary = {
  id: string
  filename: string
  documentType: string
  riskScore: number
  summary: string
  keyRisks: number
  obligations: number
  rights: number
  uploadTime: string | Date
  confidence: number
}

export function SummaryCard() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [summaries, setSummaries] = React.useState<DocumentSummary[]>([])

  React.useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/documents", { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load summaries (${res.status})`)
        const data = await res.json()
        if (active) setSummaries((data?.documents || []).filter(Boolean))
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unknown error")
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, [])

  const total = summaries.length
  const avgRisk = summaries.length
    ? Math.round(
        (summaries.reduce((a, b) => a + (Number(b.riskScore) || 0), 0) / summaries.length) * 10
      ) / 10
    : 0
  const avgConfidence = summaries.length
    ? Math.round(
        (summaries.reduce((a, b) => a + (Number(b.confidence) || 0), 0) / summaries.length) * 10
      ) / 10
    : 0
  const lastUpload = summaries
    .slice()
    .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())[0]?.uploadTime

  return (
    <div className="rounded-lg p-4 bg-white card-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Summary</h3>
        {loading ? (
          <span className="text-xs text-gray-500">Loading…</span>
        ) : error ? (
          <span className="text-xs text-red-600">{error}</span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Documents" value={total} />
        <Stat label="Avg Risk" value={`${avgRisk}`} />
        <Stat label="Avg Confidence" value={`${avgConfidence}%`} />
        <Stat label="Last Upload" value={lastUpload ? new Date(lastUpload).toLocaleString() : "—"} />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Recent</h4>
        {summaries.length === 0 ? (
          <p className="text-sm text-gray-600">No documents yet.</p>
        ) : (
          <ul className="divide-y">
            {summaries
              .slice()
              .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())
              .slice(0, 3)
              .map((d) => (
                <li key={d.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" title={d.filename}>
                      {d.filename}
                    </p>
                    <p className="text-xs text-gray-600">{d.documentType}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                    Risk: {Math.round(Number(d.riskScore) || 0)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  )
}

export default SummaryCard
