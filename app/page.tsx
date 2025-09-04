"use client"
import { useState, useEffect } from "react"
import Hero from "@/components/home/hero"
import Features from "@/components/features"
import { TestimonialsSection } from "@/components/testimonials"
import { NewReleasePromo } from "@/components/new-release-promo"
import { FAQSection } from "@/components/faq-section"
import { PricingSection } from "@/components/pricing-section"
import { StickyFooter } from "@/components/sticky-footer"
import Particles from "@/components/Particles"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark", "system")
    root.classList.add("light")
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        const headerOffset = 120 // Account for sticky header height + margin
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Particles Background */}
      <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-gray-900/70 md:flex backdrop-blur-xl border border-gray-700/50 shadow-2xl transition-all duration-300 ${
          isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
        } py-2`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1000px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-4" : ""
          }`}
          href="/"
        >
          <div className="text-white font-bold text-xl tracking-tight">Legal Lens</div>
        </a>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-gray-300 transition duration-200 hover:text-white md:flex md:space-x-2">
          <a
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
            href="/"
          >
            <span className="relative z-20">Home</span>
          </a>
          <a
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("features")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                })
              }
            }}
          >
            <span className="relative z-20">Features</span>
          </a>
          <a
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("how-it-works")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                })
              }
            }}
          >
            <span className="relative z-20">How It Works</span>
          </a>
          <a
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("about")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                })
              }
            }}
          >
            <span className="relative z-20">About Us</span>
          </a>
          <a
            className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 backdrop-blur-sm"
            href="#contact"
          >
            <span className="relative z-20">Contact</span>
          </a>
        </div>
      </header>

      {/* Mobile Header */}
      <header 
        className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 shadow-2xl md:hidden px-4 py-3"
        style={{ position: "relative", zIndex: 10 }}
      >
        <a
          className="flex items-center justify-center gap-2"
          href="/"
        >
          <div className="text-white font-bold text-lg tracking-tight">Legal Lens</div>
        </a>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 transition-all duration-300 hover:bg-white/20"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-md md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="text-left px-4 py-3 text-lg font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Home
              </button>
              <button
                onClick={() => handleMobileNavClick("features")}
                className="text-left px-4 py-3 text-lg font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                Features
              </button>
              <button
                onClick={() => handleMobileNavClick("how-it-works")}
                className="text-left px-4 py-3 text-lg font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                How It Works
              </button>
              <button
                onClick={() => handleMobileNavClick("about")}
                className="text-left px-4 py-3 text-lg font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                About Us
              </button>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left px-4 py-3 text-lg font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10 cursor-pointer"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Hero />
      </div>

      {/* Features Section */}
      <div id="features" style={{ position: "relative", zIndex: 1 }}>
        <Features />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" style={{ position: "relative", zIndex: 1 }}>
        <TestimonialsSection />
      </div>

      {/* About Us Section */}
      <div id="about" style={{ position: "relative", zIndex: 1 }}>
        <PricingSection />
      </div>

      {/* Call to Action Section */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <NewReleasePromo />
      </div>

      {/* FAQ Section */}
      <div id="faq" style={{ position: "relative", zIndex: 1 }}>
        <FAQSection />
      </div>

      {/* Sticky Footer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <StickyFooter />
      </div>
    </div>
  )
}
