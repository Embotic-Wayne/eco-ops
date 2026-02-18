"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, Loader2, ChevronRight, Sparkles } from "lucide-react"

function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AiChatbot() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex flex-col h-full border-l border-eco-border bg-eco-surface terminal-noise">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-eco-border bg-eco-surface-2">
        <Bot size={14} className="text-eco-blue" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-blue uppercase">
          EcoOps AI Assistant
        </span>
        <motion.div
          className="ml-auto flex items-center gap-1.5"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles size={10} className="text-eco-green" />
          <span className="text-[8px] font-mono tracking-widest text-eco-green">ONLINE</span>
        </motion.div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 inset-panel mx-2 mt-2 rounded-sm bg-eco-bg/50"
      >
        {/* Welcome message when empty */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center flex flex-col items-center gap-2">
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Bot size={24} className="text-eco-blue/40" />
              </motion.div>
              <p className="text-[10px] font-mono text-eco-text-dim leading-relaxed max-w-[200px]">
                EcoOps AI ready. Query environmental threat data, request tactical analysis, or issue field directives.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const text = getUIMessageText(msg)
            if (!text) return null
            return (
              <motion.div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`
                    max-w-[85%] px-3 py-2 rounded-sm text-[11px] font-mono leading-relaxed
                    ${msg.role === "user"
                      ? "bg-eco-blue/10 border border-eco-blue/20 text-eco-blue"
                      : "bg-eco-green/5 border border-eco-green/15 text-eco-text"
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[8px] font-bold tracking-widest uppercase ${
                        msg.role === "user" ? "text-eco-blue/70" : "text-eco-green/70"
                      }`}
                    >
                      {msg.role === "user" ? "OPERATIVE" : "ECOOPS AI"}
                    </span>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-[2px] h-3 ml-1">
                        {Array.from({ length: 3 }, (_, i) => (
                          <motion.div
                            key={i}
                            className="w-[2px] bg-eco-green rounded-full"
                            animate={{ height: ["2px", "10px", "4px", "8px", "2px"] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="whitespace-pre-wrap">{text}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Streaming indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="px-3 py-2 rounded-sm text-[11px] font-mono bg-eco-green/5 border border-eco-green/15 text-eco-text-dim">
              <div className="flex items-center gap-2">
                <Loader2 size={10} className="animate-spin text-eco-green" />
                <span className="text-[8px] tracking-widest">PROCESSING...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 mx-2 mb-2 mt-2">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-eco-bg border border-eco-border rounded-sm bevel-panel">
          <ChevronRight size={12} className="text-eco-blue/60" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query EcoOps AI..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs font-mono text-eco-text placeholder:text-eco-text-dim/50 outline-none"
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center w-8 h-8 rounded-sm bg-eco-blue/15 border border-eco-blue/40 text-eco-blue cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          whileHover={!isLoading && input.trim() ? { scale: 1.05, boxShadow: "0 0 15px rgba(55,184,255,0.3)" } : {}}
          whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </motion.button>
      </form>
    </div>
  )
}
