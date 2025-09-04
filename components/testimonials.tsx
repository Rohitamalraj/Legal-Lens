import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Brain, Eye } from "lucide-react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload",
    description: "Add your PDF, DOC, or scanned legal file.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20"
  },
  {
    step: "02", 
    icon: Brain,
    title: "Analyze",
    description: "Our AI simplifies clauses and highlights hidden risks.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20"
  },
  {
    step: "03",
    icon: Eye,
    title: "Understand",
    description: "Get clear, actionable insights — in your language.",
    color: "text-green-400",
    bgColor: "bg-green-400/10", 
    borderColor: "border-green-400/20"
  }
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="how-it-works" className="py-12 sm:py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="group relative z-[60] mx-auto rounded-full border border-primary/20 bg-primary/5 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative text-primary">How It Works</span>
            </button>
          </div>

          <h2
            className={cn(
              "via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
              geist.className,
            )}
          >
            3 Simple Steps
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform complex legal documents into clear, understandable insights in just three easy steps.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="relative z-10 text-center">
                  {/* Step Number Above */}
                  <div className="mb-6">
                    <div className="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-24 h-24 mx-auto rounded-full ${step.bgColor} border-2 ${step.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`w-10 h-10 ${step.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
