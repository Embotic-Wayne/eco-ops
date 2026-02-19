"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Terminal, ChevronRight, ShieldAlert } from "lucide-react"
import { speakText } from "@/lib/utils/speech"

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
}

function SeverityWidget({ level, label }: SeverityWidgetProps) {
  return (
    <motion.div
      className="relative my-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-sm border border-[#ff3b3b]/60 bg-[#ff3b3b]/10"
        animate={{
          borderColor: ["rgba(255,59,59,0.6)", "rgba(255,59,59,0.3)", "rgba(255,59,59,0.6)"],
          boxShadow: [
            "0 0 10px rgba(255,59,59,0.2), inset 0 0 10px rgba(255,59,59,0.05)",
            "0 0 20px rgba(255,59,59,0.3), inset 0 0 15px rgba(255,59,59,0.08)",
            "0 0 10px rgba(255,59,59,0.2), inset 0 0 10px rgba(255,59,59,0.05)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
        <motion.div
          className="ml-auto flex items-center gap-1.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
      </motion.div>
    </motion.div>
  )
}

function getSeverityLabel(level: number): string {
  if (level <= 3) return "LOW"
  if (level <= 6) return "ELEVATED"
  if (level <= 8) return "HIGH"
  return "CRITICAL"
}

interface TerminalDockProps {
  onSeverityResult?: (data: { severity: number; final_report?: string; action_plan?: string[]; hazard_data?: { type: string; location: string } }) => void
  onAgentStep?: (step: string, payload?: any) => void
  onReset?: () => void
  onProvider?: (provider: string) => void
}

export function TerminalDock({ onSeverityResult, onAgentStep, onReset, onProvider }: TerminalDockProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messageIdRef = useRef(1)
  const finalTranscriptRef = useRef("")

  const MIN_INPUT_ROWS = 1
  const MAX_INPUT_ROWS = 6

  const resizeInput = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    const lineHeight = 20
    const rows = Math.min(MAX_INPUT_ROWS, Math.max(MIN_INPUT_ROWS, Math.ceil(el.scrollHeight / lineHeight)))
    el.style.height = `${rows * lineHeight}px`
  }, [])

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ""
          
          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }
          
          // Update input with interim results while speaking, final when done
          if (interimTranscript) {
            setInputValue(finalTranscriptRef.current + interimTranscript)
          } else if (finalTranscriptRef.current) {
            setInputValue(finalTranscriptRef.current.trim())
          }
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          // Only stop listening on certain errors
          if (event.error === "no-speech" || event.error === "aborted") {
            setIsListening(false)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
          // Ensure final transcript is set
          if (finalTranscriptRef.current.trim()) {
            setInputValue(finalTranscriptRef.current.trim())
          }
          finalTranscriptRef.current = ""
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleMicClick = useCallback(() => {
    if (recognitionRef.current) {
      if (isListening) {
        // Stop recording gracefully - allow final results to be processed
        finalTranscriptRef.current = inputValue // Preserve current input
        recognitionRef.current.stop()
        // The onend handler will finalize the transcript
      } else {
        // Start fresh recording
        finalTranscriptRef.current = ""
        setInputValue("")
        recognitionRef.current.start()
        setIsListening(true)
      }
    }
  }, [isListening, inputValue])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return

    // Reset agent outputs for new analysis
    onReset?.()

    const userMessage: ChatMessage = {
      id: messageIdRef.current++,
      role: "user",
      text: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    // Add placeholder AI message
    const aiMessageId = messageIdRef.current++
    const placeholderMessage: ChatMessage = {
      id: aiMessageId,
      role: "ai",
      text: "Analyzing incident...",
      hasWaveform: true,
    }
    setMessages((prev) => [...prev, placeholderMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (!reader) {
        throw new Error("No response body")
      }

      let finalPayload: any = null
      let clarificationQuestion: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const event = JSON.parse(line)
            
            if (event.step === "end") {
              finalPayload = event.payload
            } else if (event.step === "clarification" && event.payload?.question) {
              clarificationQuestion = event.payload.question
              // Show the follow-up question immediately
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        text: event.payload.question,
                        hasWaveform: false,
                      }
                    : msg
                )
              )
              // Speak the clarification question out loud
              void speakText(event.payload.question, { rate: 0.95, pitch: 1.0 })
            } else if (event.step && event.step !== "error" && event.step !== "clarification") {
              onAgentStep?.(event.step, event.payload)
            }
          } catch (e) {
            console.error("Failed to parse event:", e, line)
          }
        }
      }

      // Finalize AI message: keep clarification question as main text, add severity widget if we have it
      if (finalPayload || clarificationQuestion) {
        const displayText =
          clarificationQuestion ||
          (finalPayload?.severity
            ? `Analysis complete. Severity Level ${finalPayload.severity}/10 (${getSeverityLabel(finalPayload.severity)}). See Reasoning Logs for details.`
            : "Analysis complete. See Reasoning Logs for detailed assessment.")

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  text: displayText,
                  hasWaveform: false,
                  severityWidget: finalPayload?.severity
                    ? {
                        level: finalPayload.severity,
                        label: getSeverityLabel(finalPayload.severity),
                      }
                    : undefined,
                }
              : msg
          )
        )

        // Call severity result callback
        if (finalPayload.severity) {
          onSeverityResult?.({
            severity: finalPayload.severity,
            final_report: finalPayload.final_report,
            action_plan: finalPayload.action_plan,
            hazard_data: finalPayload.hazard_data,
          })
        }
        // Sponsor track: notify when analysis used GreenPT
        if (finalPayload.provider) {
          onProvider?.(finalPayload.provider)
        }
      } else {
        // Remove placeholder if no final payload
        setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Error processing request. Please try again.",
                hasWaveform: false,
              }
            : msg
        )
      )
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, onSeverityResult, onAgentStep, onReset, onProvider])

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(inputValue)
    }
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  useEffect(() => {
    resizeInput()
  }, [inputValue, resizeInput])

  return (
    <div className="flex flex-col h-full border-x border-eco-border bg-eco-surface terminal-noise">
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
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-mono text-eco-text-dim text-center">
              Click the mic or type a message to report an environmental incident.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className={`
                max-w-[75%] min-w-0 px-3 py-2 rounded-sm text-[11px] font-mono leading-relaxed break-words
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
              <span className="whitespace-pre-wrap break-words">{msg.text}</span>
              {msg.severityWidget && (
                <SeverityWidget
                  level={msg.severityWidget.level}
                  label={msg.severityWidget.label}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Row */}
      <div className="flex items-end gap-3 p-3 mx-2 mb-2 mt-2 min-w-0">
        <div className="flex items-end gap-2 flex-1 min-w-0 px-3 py-2 bg-eco-bg border border-eco-border rounded-sm bevel-panel">
          <ChevronRight size={14} className="text-eco-green/60 shrink-0 mb-1.5" />
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or click mic..."
            disabled={isProcessing}
            rows={MIN_INPUT_ROWS}
            className="flex-1 min-w-0 w-full min-h-[20px] max-h-[120px] resize-none overflow-y-auto hide-scrollbar bg-transparent text-xs font-mono text-eco-text placeholder:text-eco-text-dim/50 outline-none disabled:opacity-50 py-0"
          />
        </div>
        <motion.button
          onClick={handleMicClick}
          disabled={isProcessing || !recognitionRef.current}
          className={`relative flex items-center justify-center w-10 h-10 rounded-sm border cursor-pointer ${
            isListening
              ? "bg-eco-red/20 border-eco-red/60 text-eco-red"
              : "bg-eco-green/15 border-eco-green/40 text-eco-green"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={!isProcessing && recognitionRef.current ? { scale: 1.05 } : {}}
          whileTap={!isProcessing && recognitionRef.current ? { scale: 0.95 } : {}}
          animate={
            !isListening && !isProcessing && recognitionRef.current
              ? {
                  boxShadow: [
                    "0 0 8px rgba(43,255,136,0.2)",
                    "0 0 16px rgba(43,255,136,0.35)",
                    "0 0 8px rgba(43,255,136,0.2)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mic size={18} />
        </motion.button>
        {inputValue.trim() && (
          <motion.button
            onClick={handleSend}
            disabled={isProcessing}
            className="px-3 py-2 text-xs font-mono text-eco-green border border-eco-green/40 bg-eco-green/10 rounded-sm hover:bg-eco-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            SEND
          </motion.button>
        )}
      </div>
    </div>
  )
}
