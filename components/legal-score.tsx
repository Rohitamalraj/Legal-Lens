"use client"

type Props = { score: number }

export function LegalScore({ score }: Props) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">Legal Literacy Score</span>
        <span className="text-sm font-semibold">{pct}/100</span>
      </div>
      <div
        className="h-2 rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-electric) 0%, var(--color-brand) 100%)",
          }}
        />
      </div>
    </div>
  )
}
