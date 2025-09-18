import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"
import Link from "next/link"
import BlurText from "./BlurText"

export function Hero() {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };

  const buttonNew = (
    <Button asChild className="rounded-full bg-purple-600 px-6 text-white hover:bg-purple-500">
      <Link href="/document-upload">
        Try Document Analysis
      </Link>
    </Button>
  )

  return (
    <section className="relative isolate overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-14 sm:py-20">
          <div className="mb-5 flex items-center justify-center">
            <p className="text-sm uppercase tracking-[0.25em] text-purple-300/80">Legal Lens</p>
          </div>
          <div className="relative z-0">
            <h1 className="mt-3 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <div className="block">
                <BlurText
                  text="AI-POWERED"
                  delay={150}
                  animateBy="words"
                  direction="top"
                  className="text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.35)] justify-center"
                />
              </div>
              <div className="block">
                <BlurText
                  text="LEGAL ANALYSIS"
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-white justify-center"
                />
              </div>
            </h1>
          </div>
          
          <p className="mt-8 text-center text-xl text-gray-300 max-w-2xl font-medium">
            Transform complex legal documents into clear, actionable insights with our AI-powered analysis platform.
          </p>
          <div className="mt-8">{buttonNew}</div>

          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-2xl">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-white mb-1">10,000+</div>
              <p className="text-sm text-gray-400">Documents Analyzed</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-white mb-1">95%</div>
              <p className="text-sm text-gray-400">Time Saved</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
              <p className="text-sm text-gray-400">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
