"use client"

import Link from "next/link"

export function Header() {
  return (
    <header
      className="w-full border-b bg-white"
      aria-label="Primary header"
      style={{ borderColor: "rgba(30,58,138,0.08)" }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="LegalEase home">
          <div
            className="h-8 w-8 rounded-md"
            style={{
              background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
            }}
            aria-hidden="true"
          />
          <span className="font-sans text-lg font-semibold tracking-tight" style={{ color: "var(--color-brand)" }}>
            LegalEase
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md px-3 py-2 text-sm font-medium border"
            style={{ borderColor: "rgba(55,65,81,0.15)" }}
          >
            Docs
          </button>
          <button
            className="rounded-md px-3 py-2 text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
            }}
          >
            Upload Document
          </button>
        </div>
      </div>
    </header>
  )
}
