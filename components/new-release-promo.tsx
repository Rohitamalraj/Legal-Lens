"use client"

import { motion, useInView } from "framer-motion"
import { Upload, ArrowRight } from "lucide-react"
import { useRef, useState } from "react"

export function NewReleasePromo() {
  const ref = useRef(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file)
        setIsUploading(true)
        
        setTimeout(() => {
          setIsUploading(false)
          alert(`File "${file.name}" uploaded successfully! 📄✅`)
        }, 2000)
      } else {
        alert('Please upload a PDF, DOCX, or TXT file.')
      }
    }
  }

  return (
    <section className="mt-12 w-full">
      <div className="mx-auto max-w-4xl rounded-[40px] border border-border/20 p-2 shadow-sm">
        <div className="relative mx-auto h-[400px] max-w-4xl overflow-hidden rounded-[38px] border border-border/20 bg-gradient-to-br from-primary via-primary to-purple-600 p-2 shadow-sm">
          {/* Subtle radial glow from center */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(147, 51, 234, 0.2), transparent 70%)",
            }}
          />

          {/* Film grain overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="mt-8 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold text-white mb-6"
              >
                Don't get lost in legal jargon.
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-white/80 mb-8 text-lg max-w-2xl mx-auto"
              >
                Upload your contract today and see the truth with Legal Lens.
              </motion.p>

              {/* Decorative Legal Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fill-white/10 stroke-white/60 mx-auto mb-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                  <path d="M9 13h6"/>
                  <path d="M9 17h6"/>
                  <path d="M9 9h1"/>
                </svg>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center justify-center"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                
                <div onClick={handleFileUpload}>
                  <div className="group border-white/20 bg-white/10 backdrop-blur-sm flex h-[64px] cursor-pointer items-center gap-2 rounded-full border p-[11px] mt-10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="border-white/20 bg-white flex h-[43px] items-center justify-center rounded-full border">
                      <p className="mr-3 ml-3 flex items-center justify-center gap-2 font-medium tracking-tight text-primary">
                        {isUploading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : uploadedFile ? (
                          <>
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            File Uploaded!
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Try Legal Lens Free
                          </>
                        )}
                      </p>
                    </div>
                    <div className="border-white/30 text-white/70 flex size-[26px] items-center justify-center rounded-full border-2 transition-all ease-in-out group-hover:ml-2 group-hover:text-white">
                      <ArrowRight className="w-4 h-4 transition-all ease-in-out group-hover:rotate-45" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background Text */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute inset-x-0 mt-[120px] text-center text-[80px] font-bold text-transparent sm:mt-[30px] sm:text-[160px] pointer-events-none"
              style={{
                WebkitTextStroke: "1px rgba(255,255,255,0.1)",
                color: "transparent",
              }}
              aria-hidden="true"
            >
              Legal Lens
            </motion.h1>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute inset-x-0 mt-[120px] text-center text-[80px] font-bold text-white/5 sm:mt-[30px] sm:text-[160px] pointer-events-none"
              aria-hidden="true"
            >
              Legal Lens
            </motion.h1>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute top-16 left-8 text-white/30 text-sm hidden md:block"
          >
            🚨 Risk Detection
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute top-24 right-8 text-white/30 text-sm hidden md:block"
          >
            ✅ Rights Protection
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/30 text-sm hidden md:block"
          >
            ⚠️ Clear Obligations
          </motion.div>
        </div>
      </div>
    </section>
  )
}
