"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeaturesContent {
  title: string
  subtitle: string
}

const defaultContent: FeaturesContent = {
  title: "Why legal professionals trust Legal Lens.",
  subtitle: "Discover how AI transforms complex legal documents into clear insights",
}

export function Features() {
  const [content, setContent] = useState<FeaturesContent>(defaultContent)

  useEffect(() => {
    // Load content from localStorage
    const savedContent = localStorage.getItem("skitbit-content")
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent)
        if (parsed.features) {
          setContent(parsed.features)
        }
      } catch (error) {
        console.error("Error parsing saved content:", error)
      }
    }
  }, [])

  return (
    <section id="features" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="mb-8 text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {content.title}
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Accuracy Card - Hidden on mobile */}
        <Card className="hidden md:block liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <p className="text-[11px] tracking-widest text-neutral-400">AI ACCURACY</p>
            <CardTitle className="mt-1 text-xl text-white">Understand complex legal documents instantly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <span className="text-gray-300">Contract Analysis</span>
                <span className="text-purple-300 font-semibold">98% Accurate</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <span className="text-gray-300">Risk Assessment</span>
                <span className="text-purple-300 font-semibold">95% Reliable</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <span className="text-gray-300">Key Terms Extraction</span>
                <span className="text-purple-300 font-semibold">99% Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Testimonial Card - Always visible */}
        <Card className="liquid-glass border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <p className="text-[11px] tracking-widest text-neutral-400">USER TESTIMONIAL</p>
            <CardTitle className="mt-1 text-xl text-white">
              "Legal Lens transformed how I review contracts. What used to take hours now takes minutes, and I catch details I would have missed."
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-end gap-4">
              <div className="text-5xl font-bold text-purple-300">4.9</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-purple-300 text-purple-300" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Contract risks identified in seconds</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Plain English explanations</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">AI-powered insights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
