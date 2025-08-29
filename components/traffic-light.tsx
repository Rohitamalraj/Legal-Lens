"use client"

import { CheckCircle, AlertTriangle, Zap } from "lucide-react"

export function TrafficLight() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Rights, Obligations, Risks">
      <div className="rounded-lg p-4 bg-white card-shadow">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={20} color={"#10b981"} aria-hidden="true" />
          <h4 className="font-semibold">Rights</h4>
        </div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Right to timely repairs after written notice</li>
          <li>Right to receive deposit refund within 30 days</li>
          <li>Right to quiet enjoyment of the property</li>
        </ul>
      </div>
      <div className="rounded-lg p-4 bg-white card-shadow">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={20} color={"#f59e0b"} aria-hidden="true" />
          <h4 className="font-semibold">Obligations</h4>
        </div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Pay rent by the 5th of each month</li>
          <li>Maintain cleanliness and avoid property damage</li>
          <li>Seek written approval before subletting</li>
        </ul>
      </div>
      <div className="rounded-lg p-4 bg-white card-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={20} color={"#ef4444"} aria-hidden="true" />
          <h4 className="font-semibold">Risks</h4>
        </div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>₹500/day penalty on late rent</li>
          <li>Early lease termination fee of one month’s rent</li>
          <li>Loss of deposit for significant damages</li>
        </ul>
      </div>
    </div>
  )
}
