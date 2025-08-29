"use client"

import { useState } from "react"

type Msg = { role: "user" | "assistant"; text: string }

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: "Ask me about your contract..." }])
  const [input, setInput] = useState("")

  const onSend = () => {
    if (!input.trim()) return
    const userMsg: Msg = { role: "user", text: input.trim() }
    const mockAnswer: Msg = {
      role: "assistant",
      text: input.toLowerCase().includes("break this lease")
        ? "If you break the lease early, you may owe an early termination fee (often one month’s rent) and remain responsible until the unit is re-rented."
        : "I'll analyze that clause and highlight any risks, obligations, and your rights in plain English.",
    }
    setMessages((m) => [...m, userMsg, mockAnswer])
    setInput("")
  }

  return (
    <div className="rounded-lg bg-white p-4 card-shadow" role="region" aria-label="Contract Q&A">
      <h3 className="font-semibold mb-2" style={{ color: "var(--color-brand)" }}>
        Interactive Q&amp;A
      </h3>
      <div
        className="h-48 overflow-y-auto border rounded-md p-3 space-y-2"
        style={{ borderColor: "rgba(55,65,81,0.15)" }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={["inline-block px-3 py-2 rounded-md text-sm", m.role === "user" ? "text-white" : ""].join(" ")}
              style={{
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)"
                    : "rgba(30,58,138,0.08)",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about your contract..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "rgba(55,65,81,0.15)" }}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          aria-label="Type your question"
        />
        <button
          onClick={onSend}
          className="rounded-md px-3 py-2 text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
          }}
        >
          Send
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-600">Example: “What happens if I break this lease early?”</p>
    </div>
  )
}
