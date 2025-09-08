"use client"

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"

const size = 160

export function RiskRadar({ percent }: { percent: number }) {
  const value = Math.max(0, Math.min(100, percent))
  const data = [{ name: "Risk", value, fill: "var(--color-danger)" }]

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }} aria-label="Risk percentage">
        <RadialBarChart
          width={size}
          height={size}
          cx={size / 2}
          cy={size / 2}
          innerRadius={60}
          outerRadius={80}
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-600">Risk Score</span>
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">65/100 (Moderate Risk)</p>
    </div>
  )
}
