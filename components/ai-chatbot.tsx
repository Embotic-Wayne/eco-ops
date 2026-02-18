"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, ChevronRight, Sparkles } from "lucide-react"

interface MockMessage {
  id: number
  role: "user" | "assistant"
  text: string
}

const mockHistory: MockMessage[] = [
  {
    id: 1,
    role: "user",
    text: "EcoOps, provide threat summary for Sector 7.",
  },
  {
    id: 2,
    role: "assistant",
    text: "Sector 7 threat assessment: Wildfire WF-7721 advancing NE at 2.3 km/h. Wind shear NW 41kn. Settlement Alpha in projected 90-min encroachment zone. Air quality PM2.5 3x threshold. Recommend immediate DEFCON escalation.",
  },
  {
    id: 3,
    role: "user",
    text: "What assets are available for rapid deployment?",
  },
  {
    id: 4,
    role: "assistant",
    text: "Available assets: Strike Team Ember (8 operatives, on standby), Aerial Tanker Unit Bravo (2x C-130H, fueled), Hydro Response Unit (mobile pump array). ETA to AO: 12-18 min. Satellite thermal uplink refreshing every 45s.",
  },
  {
    id: 5,
    role: "user",
    text: "Calculate evacuation window for Settlement Alpha.",
  },
]

const typingResponse: MockMessage = {
  id: 6,
  role: "assistant",
  text: "Analyzing geospatial vectors... Settlement Alpha evacuation window: 87 minutes remaining. Route 12 corridor is optimal egress. Capacity: 340 civilians. Recommend dispatching convoy assets immediately. Coordinating with Station Delta for resource allocation...",
}

function AudioWaveform({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-[2px] h-3 ml-1">
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: ["2px", "10px", "4px", "8px", "2px"] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

export function AiChatbot() {
  const [inputValue, setInputValue] = useState("")
  const [showTyping, setShowTyping] = useState(false)
  const [typedText, setTypedText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showTyping) return
    let index = 0
    const interval = setInterval(() => {
      if (index <= typingResponse.text.length) {
        setTypedText(typingResponse.text.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [showTyping])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [typedText, showTyping])

  return (
    <div className="flex flex-col h-full border-l border-eco-border bg-eco-surface terminal-noise">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-eco-border bg-eco-surface-2">
        <Bot size={14} className="text-[#37b8ff]" />
        <span className="text-xs font-sans font-bold tracking-wider text-[#37b8ff] uppercase">
          EcoOps AI Assistant
        </span>
        <motion.div
          className="ml-auto flex items-center gap-1.5"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles size={10} className="text-[#2bff88]" />
          <span className="text-[8px] font-mono tracking-widest text-[#2bff88]">ONLINE</span>
        </motion.div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 inset-panel mx-2 mt-2 rounded-sm bg-[#0a0e14]/50"
      >
        <AnimatePresence initial={false}>
          {mockHistory.map((msg, index) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <div
                className={`
                  max-w-[85%] px-3 py-2 rounded-sm text-[11px] font-mono leading-relaxed
                  ${msg.role === "user"
                    ? "bg-[#37b8ff]/10 border border-[#37b8ff]/20 text-[#37b8ff]"
                    : "bg-[#2bff88]/5 border border-[#2bff88]/15 text-[#c8ccd4]"
                  }
                `}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[8px] font-bold tracking-widest uppercase ${
                      msg.role === "user" ? "text-[#37b8ff]/70" : "text-[#2bff88]/70"
                    }`}
                  >
                    {msg.role === "user" ? "OPERATIVE" : "ECOOPS AI"}
                  </span>
                  {msg.role === "assistant" && <AudioWaveform color="#2bff88" />}
                </div>
                <span className="whitespace-pre-wrap">{msg.text}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing AI response */}
        {showTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-[85%] px-3 py-2 rounded-sm text-[11px] font-mono leading-relaxed bg-[#2bff88]/5 border border-[#2bff88]/15 text-[#c8ccd4]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8px] font-bold tracking-widest uppercase text-[#2bff88]/70">
                  ECOOPS AI
                </span>
                <AudioWaveform color="#2bff88" />
              </div>
              <span className="whitespace-pre-wrap">{typedText}</span>
              {typedText.length < typingResponse.text.length && (
                <motion.span
                  className="inline-block w-[6px] h-[12px] bg-[#2bff88] ml-[2px] align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-2 mx-2 mb-2 mt-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-[#0a0e14] border border-[#1e2a3a] rounded-sm bevel-panel">
          <ChevronRight size={12} className="text-[#37b8ff]/60" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Query EcoOps AI..."
            className="flex-1 bg-transparent text-xs font-mono text-[#c8ccd4] placeholder:text-[#6a6a7a]/50 outline-none"
          />
        </div>
        <motion.button
          className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#37b8ff]/15 border border-[#37b8ff]/40 text-[#37b8ff] cursor-pointer"
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(55,184,255,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={14} />
        </motion.button>
      </div>
    </div>
  )
}
