"use client"

import { motion, useInView } from "framer-motion"
import { Heart, Shield, Users, Zap } from "lucide-react"
import { useRef } from "react"

const values = [
  {
    icon: Heart,
    title: "Transparency",
    description: "We believe everyone deserves to understand what they're signing.",
    color: "text-red-400",
    bgColor: "bg-red-400/10"
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your documents are processed securely and never stored.",
    color: "text-blue-400", 
    bgColor: "bg-blue-400/10"
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Making legal documents accessible to everyone, regardless of background.",
    color: "text-green-400",
    bgColor: "bg-green-400/10"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Powered by cutting-edge AI to deliver instant, accurate insights.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10"
  }
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="about" className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm mb-6"
          >
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">About Us</span>
          </motion.div>

          <h2
            className="via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]"
          >
            Our Mission
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              At Legal Lens, we believe everyone should understand the agreements they sign. From rental contracts to loan documents, we empower people with clarity, transparency, and peace of mind — powered by AI.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 rounded-xl p-8 mb-12"
            >
              <blockquote className="text-lg italic text-white leading-relaxed">
                "Legal documents shouldn't be a mystery. Every person deserves to understand what they're agreeing to, without needing a law degree. That's why we created Legal Lens — to democratize legal understanding through the power of AI."
              </blockquote>
              <footer className="mt-6 text-gray-300">
                — The Legal Lens Team
              </footer>
            </motion.div>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="group relative rounded-xl p-6 backdrop-blur-md border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 bg-gray-900/40"
            >
              <div className={`w-12 h-12 rounded-lg ${value.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className={`w-6 h-6 ${value.color}`} />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {value.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/20 rounded-2xl p-12 text-center"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10k+</div>
              <div className="text-muted-foreground">Documents Analyzed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Languages Supported</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6 text-lg">
            Ready to see through the fine print with clarity?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            Get Started Today →
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
