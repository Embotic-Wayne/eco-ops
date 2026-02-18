"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Radio, ShieldAlert, Zap } from "lucide-react"

interface CommandHeaderProps {
  threatLevel: number
  dispatchArmed: boolean
  onDispatch: () => void
}

function getThreatColor(level: number) {
  if (level <= 3) return { color: "#2bff88", label: "LOW", class: "glow-green" }
  if (level <= 6) return { color: "#ffb020", label: "ELEVATED", class: "glow-amber" }
  if (level <= 8) return { color: "#ff3b3b", label: "HIGH", class: "glow-red" }
  return { color: "#ff3b3b", label: "CRITICAL", class: "glow-red" }
}

export function CommandHeader({ threatLevel, dispatchArmed, onDispatch }: CommandHeaderProps) {
  const threat = getThreatColor(threatLevel)

  return (
    <header className="relative flex items-center justify-between px-6 py-3 border-b border-eco-border bg-eco-surface carbon-fiber">
      {/* Left: Title */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg font-bold tracking-wider text-eco-green glow-green-text font-sans uppercase">
          EcoOps Command Center
        </h1>
        <p className="text-[10px] font-mono tracking-[0.2em] text-eco-text-dim uppercase">
          Tactical Environmental Response Interface
        </p>
      </div>

      {/* Center: Threat Level */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="flex items-center gap-3 px-5 py-2 bg-eco-bg/80 border border-eco-border rounded-sm bevel-panel">
          <ShieldAlert size={18} style={{ color: threat.color }} />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono tracking-[0.3em] text-eco-text-dim uppercase">
              Environmental Threat Level
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {/* Level bar segments */}
              <div className="flex gap-[2px]">
                {Array.from({ length: 10 }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-[6px] h-4 rounded-[1px]"
                    style={{
                      backgroundColor: i < threatLevel
                        ? threat.color
                        : "rgba(255,255,255,0.06)",
                    }}
                    animate={
                      i < threatLevel
                        ? { opacity: [0.7, 1, 0.7] }
                        : { opacity: 1 }
                    }
                    transition={
                      i < threatLevel
                        ? { duration: 1.5, repeat: Infinity, delay: i * 0.05 }
                        : undefined
                    }
                  />
                ))}
              </div>
              <span
                className="text-sm font-bold font-mono tracking-wider"
                style={{ color: threat.color, textShadow: `0 0 10px ${threat.color}50` }}
              >
                {threatLevel}/10
              </span>
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-sm border"
                style={{
                  color: threat.color,
                  borderColor: `${threat.color}40`,
                  backgroundColor: `${threat.color}10`,
                }}
              >
                {threat.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Voice Uplink + Dispatch */}
      <div className="flex items-center gap-4">
        {/* Voice Uplink */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-eco-bg/60 border border-eco-border rounded-sm">
          <Radio size={14} className="text-eco-blue" />
          <span className="text-[10px] font-mono tracking-wider text-eco-text-dim">
            LiveKit Voice Uplink:
          </span>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-eco-green"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [1, 0.5, 1],
                boxShadow: [
                  "0 0 4px rgba(43,255,136,0.5)",
                  "0 0 12px rgba(43,255,136,0.8)",
                  "0 0 4px rgba(43,255,136,0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-mono font-bold tracking-widest text-eco-green">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Dispatch Button */}
        <AnimatePresence>
          <motion.button
            onClick={onDispatch}
            disabled={!dispatchArmed}
            className={`
              relative flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-sm
              transition-all duration-300 cursor-pointer
              ${dispatchArmed
                ? "bg-eco-green/20 text-eco-green border border-eco-green/50 pulse-glow-green hover:bg-eco-green/30"
                : "bg-eco-surface-2 text-eco-text-dim/40 border border-eco-border/50 cursor-not-allowed"
              }
            `}
            animate={dispatchArmed ? { scale: [1, 1.02, 1] } : {}}
            transition={dispatchArmed ? { duration: 1.5, repeat: Infinity } : undefined}
          >
            <Zap size={14} className={dispatchArmed ? "text-eco-green" : "text-eco-text-dim/40"} />
            Dispatch Response Unit
            {dispatchArmed && (
              <motion.div
                className="absolute inset-0 rounded-sm border border-eco-green/30"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </header>
  )
}
