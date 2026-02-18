"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Loader2, ShieldAlert, ListChecks, FileText } from "lucide-react"

interface AgentOutput {
  impact?: {
    severity?: number
    population_affected?: number
    hazard_data?: { type: string; location: string }
  }
  action?: {
    action_plan?: string[]
    greenpt_score?: number
  }
  briefing?: {
    final_report?: string
  }
  // Also support direct payload structure from API
  severity?: number
  population_affected?: number
  hazard_data?: { type: string; location: string }
  action_plan?: string[]
  greenpt_score?: number
  final_report?: string
}

interface ReasoningLogsProps {
  completedSteps?: Set<string>
  currentStep?: string | null
  agentOutputs?: AgentOutput
}

const agentSteps = [
  { id: "impact", label: "Impact Agent", description: "Analyzing severity and population affected", icon: ShieldAlert },
  { id: "action", label: "Action Agent", description: "Generating response checklist and GreenPT score", icon: ListChecks },
  { id: "briefing", label: "Briefing Agent", description: "Compiling final operational report", icon: FileText },
]

export function ReasoningLogs({ completedSteps = new Set(), currentStep = null, agentOutputs = {} }: ReasoningLogsProps) {
  const getSeverityLabel = (level?: number): string => {
    if (!level) return ""
    if (level <= 3) return "LOW"
    if (level <= 6) return "ELEVATED"
    if (level <= 8) return "HIGH"
    return "CRITICAL"
  }

  return (
    <div className="flex flex-col h-full border-r border-eco-border bg-eco-surface terminal-noise">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-eco-border bg-eco-surface-2">
        <div className="w-2 h-2 rounded-full bg-eco-green animate-pulse" />
        <span className="text-xs font-sans font-bold tracking-wider text-eco-green uppercase">
          Reasoning Logs
        </span>
      </div>

      {/* Agent Steps */}
      <div className="flex-1 overflow-y-auto hide-scrollbar p-3 flex flex-col gap-3">
        {agentSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isActive = currentStep === step.id && !isCompleted
          const Icon = step.icon
          const output = agentOutputs[step.id as keyof AgentOutput] || (agentOutputs as any)[step.id]

          return (
            <motion.div
              key={step.id}
              className={`
                flex flex-col gap-2 px-3 py-2 rounded-sm border
                ${isCompleted
                  ? "border-eco-green/40 bg-eco-green/5"
                  : isActive
                    ? "border-eco-amber/40 bg-eco-amber/5"
                    : "border-eco-border/30 bg-eco-surface-2/50"
                }
              `}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Header */}
              <div className="flex items-start gap-2">
                {/* Status Icon */}
                <div className="mt-0.5">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 size={14} className="text-eco-green" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 size={14} className="text-eco-amber animate-spin" />
                  ) : (
                    <Circle size={14} className="text-eco-text-dim/40" />
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon size={12} className={isCompleted ? "text-eco-green" : isActive ? "text-eco-amber" : "text-eco-text-dim"} />
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider ${
                        isCompleted
                          ? "text-eco-green"
                          : isActive
                            ? "text-eco-amber"
                            : "text-eco-text-dim"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <motion.span
                        className="text-[8px] font-mono text-eco-green ml-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        COMPLETE
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.span
                        className="text-[8px] font-mono text-eco-amber ml-auto"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        PROCESSING...
                      </motion.span>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-eco-text-dim leading-relaxed mb-2">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Agent Output */}
              {isCompleted && output && (
                <motion.div
                  className="mt-1 pt-2 border-t border-eco-border/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  {step.id === "impact" && output && (
                    <div className="flex flex-col gap-1.5 text-[9px] font-mono">
                      {output.hazard_data && (
                        <div>
                          <span className="text-eco-text-dim">Hazard: </span>
                          <span className="text-eco-text">{output.hazard_data.type}</span>
                          {output.hazard_data.location && (
                            <>
                              <span className="text-eco-text-dim"> at </span>
                              <span className="text-eco-text">{output.hazard_data.location}</span>
                            </>
                          )}
                        </div>
                      )}
                      {output.severity !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-eco-text-dim">Severity: </span>
                          <span className={`font-bold ${
                            output.severity <= 3 ? "text-eco-green" :
                            output.severity <= 6 ? "text-eco-amber" :
                            output.severity <= 8 ? "text-[#ff3b3b]" : "text-[#ff3b3b]"
                          }`}>
                            {output.severity}/10 ({getSeverityLabel(output.severity)})
                          </span>
                        </div>
                      )}
                      {output.population_affected !== undefined && (
                        <div>
                          <span className="text-eco-text-dim">Population Affected: </span>
                          <span className="text-eco-text font-bold">{output.population_affected.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {step.id === "action" && output && (
                    <div className="flex flex-col gap-1.5 text-[9px] font-mono">
                      {output.greenpt_score !== undefined && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-eco-text-dim">GreenPT Score: </span>
                          <span className={`font-bold ${
                            output.greenpt_score >= 80 ? "text-eco-green" :
                            output.greenpt_score >= 60 ? "text-eco-amber" : "text-[#ff3b3b]"
                          }`}>
                            {output.greenpt_score}/100
                          </span>
                        </div>
                      )}
                      {output.action_plan && output.action_plan.length > 0 && (
                        <div>
                          <span className="text-eco-text-dim text-[8px] uppercase tracking-wider mb-1 block">Action Checklist:</span>
                          <ul className="list-none space-y-1">
                            {output.action_plan.map((action: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-eco-green mt-0.5">▸</span>
                                <span className="text-eco-text leading-relaxed">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {step.id === "briefing" && output && output.final_report && (
                    <div className="text-[9px] font-mono">
                      <span className="text-eco-text-dim text-[8px] uppercase tracking-wider mb-1 block">Final Report:</span>
                      <div className="text-eco-text leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[400px] hide-scrollbar">
                        {output.final_report}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        })}

        {completedSteps.size === 0 && currentStep === null && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-mono text-eco-text-dim text-center px-4">
              Agent reasoning logs will appear here as the system processes your report.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
