"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Terminal, ChevronRight, ShieldAlert } from "lucide-react"

interface ChatMessage {
  id: number
  role: "user" | "ai"
  text: string
  hasWaveform?: boolean
  severityWidget?: {
    level: number
    label: string
  }
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "user",
    text: "EcoOps, run proximity analysis on wildfire WF-7721 relative to settlement Alpha.",
  },
  {
    id: 2,
    role: "ai",
    text: "Acknowledged. Initiating multi-layer geospatial scan. Cross-referencing MODIS thermal data with real-time wind vectors...",
    hasWaveform: true,
  },
  {
    id: 3,
    role: "user",
    text: "What is the current threat radius?",
  },
  {
    id: 4,
    role: "ai",
    text: "Fire front advancing at 2.3 km/h. Wind shear from northwest at 41 kn gusts. Projecting 90-minute encroachment on settlement Alpha perimeter.",
    hasWaveform: true,
  },
]

const finalAiMessage: ChatMessage = {
  id: 5,
  role: "ai",
  text: "Situation analyzed. Wildfire proximity critical. Settlement Alpha evacuation window closing.",
  hasWaveform: true,
  severityWidget: {
    level: 9,
    label: "CRITICAL",
  },
}

function AudioWaveform() {
  return (
    <div className="flex items-center gap-[2px] h-4 ml-2">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-eco-green rounded-full"
          animate={{
            height: ["4px", "16px", "6px", "14px", "4px"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

interface SeverityWidgetProps {
  level: number
  label: string
  onArmed: () => void
}

function SeverityWidget({ level, label, onArmed }: SeverityWidgetProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setArmed(true)
      onArmed()
    }, 1200)
    return () => clearTimeout(timer)
  }, [onArmed])

  return (
    <motion.div
      className="relative my-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Arming connector */}
      <AnimatePresence>
        {armed && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-[2px] h-6 bg-gradient-to-t from-eco-green to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "bottom" }}
            />
            <motion.span
              className="text-[7px] font-mono text-eco-green tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              ARMING DISPATCH
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-sm border
          ${armed ? "border-[#ff3b3b]/60 bg-[#ff3b3b]/10" : "border-eco-border bg-eco-surface-2"}
        `}
        animate={
          armed
            ? {
                borderColor: ["rgba(255,59,59,0.6)", "rgba(255,59,59,0.3)", "rgba(255,59,59,0.6)"],
                boxShadow: [
                  "0 0 10px rgba(255,59,59,0.2), inset 0 0 10px rgba(255,59,59,0.05)",
                  "0 0 20px rgba(255,59,59,0.3), inset 0 0 15px rgba(255,59,59,0.08)",
                  "0 0 10px rgba(255,59,59,0.2), inset 0 0 10px rgba(255,59,59,0.05)",
                ],
              }
            : {}
        }
        transition={armed ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <ShieldAlert size={18} className="text-[#ff3b3b]" />
        <div className="flex flex-col">
          <span className="text-[8px] font-mono tracking-[0.2em] text-eco-text-dim uppercase">
            Calculated Severity
          </span>
          <span className="text-sm font-mono font-bold tracking-wider text-[#ff3b3b] glow-red-text">
            LEVEL {level} ({label})
          </span>
        </div>
        <AnimatePresence>
          {armed && (
            <motion.div
              className="ml-auto flex items-center gap-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-eco-green"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[8px] font-mono font-bold tracking-widest text-eco-green glow-green-text">
                DISPATCH ARMED
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

interface TerminalDockProps {
  onSeverityArmed: () => void
}

export function TerminalDock({ onSeverityArmed }: TerminalDockProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [showFinal, setShowFinal] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFinal(true)
      setMessages((prev) => [...prev, finalAiMessage])
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col border-t border-eco-border bg-eco-surface terminal-noise">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-eco-border bg-eco-surface-2">
        <Terminal size={14} className="text-eco-green" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-green uppercase">
          Field Operative Uplink Terminal
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-eco-green/60" />
          <div className="w-2 h-2 rounded-full bg-eco-amber/60" />
          <div className="w-2 h-2 rounded-full bg-eco-red/60" />
        </div>
      </div>

      {/* Chat History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3 inset-panel mx-2 mt-2 mb-0 rounded-sm bg-eco-bg/50"
      >
        <div className="flex-1" />
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            initial={msg.id > 4 ? { opacity: 0, y: 10 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className={`
                max-w-[75%] px-3 py-2 rounded-sm text-[11px] font-mono leading-relaxed
                ${msg.role === "user"
                  ? "bg-eco-blue/10 border border-eco-blue/20 text-eco-blue ml-auto"
                  : "bg-eco-green/5 border border-eco-green/15 text-eco-text"
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[8px] font-bold tracking-widest uppercase ${
                  msg.role === "user" ? "text-eco-blue/70" : "text-eco-green/70"
                }`}>
                  {msg.role === "user" ? "OPERATIVE" : "ECOOPS AI"}
                </span>
                {msg.hasWaveform && <AudioWaveform />}
              </div>
              {msg.text}
              {msg.severityWidget && showFinal && (
                <SeverityWidget
                  level={msg.severityWidget.level}
                  label={msg.severityWidget.label}
                  onArmed={onSeverityArmed}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-3 p-3 mx-2 mb-2 mt-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-eco-bg border border-eco-border rounded-sm bevel-panel">
          <ChevronRight size={14} className="text-eco-green/60" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-xs font-mono text-eco-text placeholder:text-eco-text-dim/50 outline-none"
          />
        </div>
        <motion.button
          className="relative flex items-center justify-center w-10 h-10 rounded-sm bg-eco-green/15 border border-eco-green/40 text-eco-green cursor-pointer"
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(43,255,136,0.3)" }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 8px rgba(43,255,136,0.2)",
              "0 0 16px rgba(43,255,136,0.35)",
              "0 0 8px rgba(43,255,136,0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic size={18} />
        </motion.button>
      </div>
    </div>
  )
}
