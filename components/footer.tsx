import Link from "next/link"
import { Scale, Upload, FileText, MessageCircle, Info } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Legal Lens</span>
            </div>
            <p className="text-neutral-400 mb-4 max-w-sm">
              Transform complex legal documents into clear, actionable insights with our AI-powered analysis platform.
            </p>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>Trusted by 10,000+ users</span>
              <span>•</span>
              <span>4.9/5 rating</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/document-upload" className="text-neutral-400 hover:text-purple-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Link>
              </li>
              <li>
                <Link href="/document-summary" className="text-neutral-400 hover:text-purple-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Summary
                </Link>
              </li>
              <li>
                <Link href="/q-a-chat-interface" className="text-neutral-400 hover:text-purple-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Q&A Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-purple-300 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-purple-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </Link>
              </li>
              <li>
                <a href="#privacy" className="text-neutral-400 hover:text-purple-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-neutral-400 hover:text-purple-300">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Legal Lens. All rights reserved.</p>
          <p className="text-neutral-500">
            Made with AI • Designed for Legal Professionals
          </p>
        </div>
      </div>
    </footer>
  )
}
