"use client"

import type React from "react"

import { useCallback, useState } from "react"

export function UploadDropzone() {
  const [isOver, setIsOver] = useState(false)
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }, [])
  const onDragLeave = useCallback(() => setIsOver(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    // In a real app: parse files and trigger processing
    if (e.dataTransfer.files?.length) {
      // eslint-disable-next-line no-alert
      alert(`Uploaded ${e.dataTransfer.files[0].name}`)
    }
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload legal document"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          ;(e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.click()
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={["rounded-lg border-2 border-dashed p-6 md:p-8 transition-colors", "bg-white card-shadow"].join(" ")}
      style={{
        borderColor: isOver ? "var(--color-electric)" : "rgba(30,58,138,0.25)",
      }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className="h-12 w-12 rounded-md flex items-center justify-center"
          style={{ background: "rgba(30,58,138,0.08)" }}
          aria-hidden="true"
        >
          <span className="sr-only">Document icon</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path
              d="M7 3h6l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
            />
            <path d="M13 3v5h5" stroke="var(--color-brand)" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <p className="font-medium">Drag and drop your document here</p>
          <p className="text-sm text-gray-600">or click to browse</p>
        </div>
        <button
          className="rounded-md px-3 py-2 text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-electric) 100%)",
          }}
          onClick={() => (document.getElementById("file-input") as HTMLInputElement)?.click()}
        >
          Select File
        </button>
        <input id="file-input" type="file" className="hidden" aria-hidden="true" />
      </div>
    </div>
  )
}
