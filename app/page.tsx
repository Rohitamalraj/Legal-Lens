import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { LegalScore } from "@/components/legal-score"
import { RiskRadar } from "@/components/risk-radar"
import { TrafficLight } from "@/components/traffic-light"
import { SummaryCard } from "@/components/summary-card"
import { ChatPanel } from "@/components/chat-panel"
import { ComparisonView } from "@/components/comparison-view"
import { SmartAlerts } from "@/components/alerts"

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg p-4 bg-white card-shadow" role="region" aria-label="Overview">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg text-balance" style={{ color: "var(--color-brand)" }}>
                    Analysis Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">Risk Score: 65/100 (Moderate Risk)</p>
                </div>
                <div className="w-full md:w-64">
                  <LegalScore score={78} />
                </div>
              </div>
            </div>

            <SummaryCard />
            <SmartAlerts />
            <ComparisonView />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Risk Radar">
              <RiskRadar percent={65} />
            </div>
            <div>
              <TrafficLight />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ChatPanel />
        </div>
      </section>
    </main>
  )
}
