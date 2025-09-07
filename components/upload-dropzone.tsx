"use client"

import * as React from "react"
// Optional: uncomment if you want to show toasts (package is installed)
// import { toast } from "sonner"

type UploadDropzoneProps = {
  onFiles?: (files: FileList) => void
}

const ACCEPTED = ".pdf,.doc,.docx,.txt"
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB (must match server default)

export function UploadDropzone({ onFiles }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const openPicker = () => inputRef.current?.click()

  const handleFiles = React.useCallback(
    (files: FileList) => {
      if (onFiles) onFiles(files)
      const file = files[0]
      if (!file) return

      if (!ACCEPTED.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim()))) {
        // toast?.error?.("Unsupported file type. Use PDF, DOC, DOCX, or TXT.")
        alert("Unsupported file type. Use PDF, DOC, DOCX, or TXT.")
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        // toast?.error?.(`File exceeds ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB limit`)
        alert(`File exceeds ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)}MB limit`)
        return
      }

      void upload(file)
    },
    [onFiles]
  )

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }

  const upload = async (file: File) => {
    setUploading(true)
    setProgress(0)
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/documents")

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              // toast?.success?.(`Uploaded: ${data?.document?.filename || file.name}`)
              console.log("Upload success", data)
            } catch (_) {
              // toast?.success?.("Uploaded successfully")
              console.log("Upload success")
            }
            resolve()
          } else {
            reject(new Error(`Upload failed (${xhr.status})`))
          }
        }
        xhr.onerror = () => reject(new Error("Network error during upload"))

        const formData = new FormData()
        formData.append("file", file)
        xhr.send(formData)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      // toast?.error?.(message)
      alert(message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
        className={
          `rounded-lg border border-dashed p-6 text-center cursor-pointer ` +
          (isDragging ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50")
        }
        aria-label="Upload legal document"
      >
        <p className="text-sm">
          Drag & drop a file here, or <span className="underline">browse</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">PDF, DOC, DOCX, TXT • Max 10MB</p>
        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2"
                style={{ width: `${progress}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                role="progressbar"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Uploading… {progress}%</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}

export default UploadDropzone
