"use client"

import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Users, Shield, Clock, MessageSquare, Video, Phone, Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function ConnectPage() {
  const lawyers = [
    {
      name: "Sarah Martinez",
      specialty: "Contract Law",
      experience: "12 years",
      rating: 4.9,
      reviews: 156,
      hourlyRate: "$250",
      image: "/placeholder-user.jpg",
      languages: ["English", "Spanish"],
      availability: "Available now"
    },
    {
      name: "David Chen",
      specialty: "Corporate Law",
      experience: "8 years", 
      rating: 4.8,
      reviews: 89,
      hourlyRate: "$200",
      image: "/placeholder-user.jpg",
      languages: ["English", "Mandarin"],
      availability: "Available in 2 hours"
    },
    {
      name: "Emily Rodriguez",
      specialty: "Employment Law",
      experience: "15 years",
      rating: 5.0,
      reviews: 203,
      hourlyRate: "$300",
      image: "/placeholder-user.jpg",
      languages: ["English", "French"],
      availability: "Available tomorrow"
    }
  ];

  return (
    <main className="min-h-[100dvh] text-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Connect with <span className="text-purple-300">Legal Experts</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              When AI analysis isn't enough, connect with qualified lawyers for personalized legal advice. 
              Get human expertise to clarify complex legal documents and ensure you make informed decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
                Browse Lawyers
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-black px-8 py-3 rounded-lg font-medium">
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Connect Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Connect with Legal Experts?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="liquid-glass rounded-lg p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Human Verification</h3>
                <p className="text-gray-300">
                  Get human expertise to verify AI analysis and ensure nothing critical is missed in your legal documents.
                </p>
              </div>
              
              <div className="liquid-glass rounded-lg p-6 text-center">
                <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Personalized Advice</h3>
                <p className="text-gray-300">
                  Discuss your specific situation with qualified lawyers who understand the nuances of your case.
                </p>
              </div>
              
              <div className="liquid-glass rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Quick Consultations</h3>
                <p className="text-gray-300">
                  Book 15-minute to 2-hour sessions based on your needs. Get answers without long-term commitments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Lawyers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Available Legal Experts</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer, index) => (
                <div key={index} className="liquid-glass rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-semibold text-white">{lawyer.name}</h3>
                      <p className="text-sm text-purple-300">{lawyer.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Experience:</span>
                      <span className="text-white">{lawyer.experience}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Rate:</span>
                      <span className="text-white">{lawyer.hourlyRate}/hour</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white ml-1">{lawyer.rating} ({lawyer.reviews})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-green-400 mb-2">● {lawyer.availability}</p>
                    <p className="text-xs text-gray-400">Languages: {lawyer.languages.join(", ")}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-black text-xs">
                      <Video className="w-3 h-3 mr-1" />
                      Video
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Upload Document</h3>
                <p className="text-sm text-gray-300">Start with AI analysis of your legal document</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Choose Expert</h3>
                <p className="text-sm text-gray-300">Select a lawyer specializing in your document type</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Book Session</h3>
                <p className="text-sm text-gray-300">Schedule a consultation that fits your timeline</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2 text-white">Get Clarity</h3>
                <p className="text-sm text-gray-300">Discuss concerns and get personalized legal advice</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Your Trust & Security</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Verified Lawyers</h3>
                  <p className="text-gray-300">All lawyers are licensed, background-checked, and verified by our platform.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Secure Communications</h3>
                  <p className="text-gray-300">All conversations are encrypted and protected by attorney-client privilege.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                  <p className="text-gray-300">No hidden fees. Pay only for the time you use with clear hourly rates.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Money-Back Guarantee</h3>
                  <p className="text-gray-300">Not satisfied with your consultation? Get a full refund within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Connect with Legal Experts?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Don't leave your legal decisions to chance. Get the human expertise you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium">
                <Link href="/document-upload">Start with AI Analysis</Link>
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-300 hover:bg-purple-300 hover:text-black px-8 py-3 rounded-lg font-medium">
                Browse All Lawyers
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}