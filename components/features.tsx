"use client"

import type React from "react"
import { motion, useInView } from "framer-motion"
import { Suspense, useRef, useState } from "react"
import { 
  FileText, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Languages,
  GitCompare
} from "lucide-react"

export default function LegalLensFeatures() {
  const featuresContainerRef = useRef(null)
  const featuresInView = useInView(featuresContainerRef, { once: true, amount: 0.3 })

  const features = [
    {
      icon: FileText,
      title: "Simplified Summaries",
      description: "Break down contracts into simple English",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      icon: Search,
      title: "Risk Radar Dashboard",
      description: "Color-coded highlights for Risks 🚨, Rights ✅, and Obligations ⚠️",
      color: "text-red-400", 
      bgColor: "bg-red-400/10"
    },
    {
      icon: MessageSquare,
      title: "Ask Your Contract",
      description: "Chat with your document and get instant answers",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      icon: GitCompare,
      title: "Clause Comparison",
      description: "Upload two agreements and instantly spot key differences",
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      icon: Languages,
      title: "Multi-Language Support",
      description: "Translate legal documents into Hindi, Tamil, Bengali, and more",
      color: "text-indigo-400",
      bgColor: "bg-indigo-400/10"
    }
  ]

  return (
    <section id="features" className="text-foreground relative overflow-hidden py-12 sm:py-24 md:py-32">
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>
      
      <motion.div
        ref={featuresContainerRef}
        initial={{ opacity: 0, y: 50 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className="via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]"
          >
            Why Legal Lens?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Smart tools that make legal documents easy to understand for everyone.
          </p>
        </div>

        {/* Features Grid - Symmetrical Layout */}
        <div className="w-full max-w-6xl mx-auto">
          {/* First row - 2 features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="border-gray-700/30 text-white relative flex flex-col overflow-hidden rounded-xl border-2 p-8 shadow-xl transition-all ease-in-out hover:scale-105 hover:border-gray-600/50 hover:shadow-2xl bg-gray-900/40 backdrop-blur-md h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second row - 3 features centered */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.slice(2, 5).map((feature, index) => (
              <motion.div
                key={index + 2}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                className="group relative"
              >
                <div className="border-gray-700/30 text-white relative flex flex-col overflow-hidden rounded-xl border-2 p-8 shadow-xl transition-all ease-in-out hover:scale-105 hover:border-gray-600/50 hover:shadow-2xl bg-gray-900/40 backdrop-blur-md h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 w-full max-w-4xl mx-auto"
        >
          <div className="border-gray-700/30 text-white relative overflow-hidden rounded-xl border-2 p-8 shadow-xl bg-gray-900/40 backdrop-blur-md">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-semibold tracking-tight mb-4 text-white">
                See Legal Lens in Action
              </h3>
              <p className="text-gray-300">
                Upload a legal document and watch our AI break it down into simple, understandable language
              </p>
            </div>

            {/* Mock Interface */}
            <div className="bg-gray-800/60 rounded-lg p-6 border border-gray-600/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Contract.pdf</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Analyzed</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-red-500 font-semibold">Risks Found</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Auto-renewal clause with 30-day notice
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-semibold">Your Rights</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    30-day money-back guarantee included
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Obligations</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monthly payment of $99 required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
