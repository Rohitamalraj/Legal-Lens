"use client"

import { UploadDropzone } from "./upload-dropzone"

export function Hero() {
  return (
    <section
      className="w-full"
      aria-labelledby="hero-title"
      style={{
        background: "linear-gradient(180deg, rgba(30,58,138,0.08) 0%, rgba(59,130,246,0.06) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <h1
            id="hero-title"
            className="font-sans text-3xl md:text-4xl font-bold text-pretty"
            style={{ color: "var(--color-brand)" }}
          >
            Transform Complex Legal Documents into Simple English
          </h1>
          <p className="mt-3 text-base leading-relaxed max-w-2xl">
            Upload leases, agreements, or policies and get a plain-English summary, risks, obligations, and rights—plus
            an interactive Q&amp;A.
          </p>
        </div>

        <div className="mt-6">
          <UploadDropzone />
          <p className="mt-2 text-sm text-gray-600" aria-live="polite">
            PDF, DOC, TXT supported. Your data is processed securely.
          </p>
        </div>
      </div>
    </section>
  )
}
