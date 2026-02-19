"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-eco-bg hex-grid-bg relative overflow-x-hidden">
      <div className="crt-scanlines" />

      <motion.div
        className="flex flex-col items-center justify-center gap-8 px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src="/ecoops-logo.svg"
            alt=""
            className="h-24 w-24 object-contain drop-shadow-[0_0_20px_rgba(43,255,136,0.3)]"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold tracking-wider text-eco-green glow-green-text font-sans uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          EcoOps
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-eco-text-dim text-sm md:text-base font-mono tracking-wider max-w-md leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          AI Assisted First Responder for Environmental Hazards
        </motion.p>

        {/* Report Incident button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <Link href="/command-center" className="block">
            <motion.span
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-sm font-bold tracking-wider uppercase rounded-sm border border-eco-green/50 bg-eco-green/20 text-eco-green hover:bg-eco-green/30 transition-colors cursor-pointer"
              whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(43,255,136,0.25)" }}
              whileTap={{ scale: 0.98 }}
            >
              Report Incident
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
