"use client"

import type { Metadata } from "next";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero"
import { Workflow } from "@/components/workflow"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"

// Smooth scroll reveal animation variants
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function AboutPage() {
  return (
    <motion.main 
      className="min-h-[100dvh] text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <SiteHeader />
      
      <motion.div variants={fadeInUp}>
        <Hero />
      </motion.div>
      
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Workflow />
      </motion.div>
      
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Features />
      </motion.div>
      
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Footer />
      </motion.div>
    </motion.main>
  );
}