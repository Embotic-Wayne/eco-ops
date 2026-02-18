"use client"

import { useState, useCallback } from "react"
import { CommandHeader } from "@/components/command-header"
import { TacticalMap } from "@/components/tactical-map"
import { IncidentFeed } from "@/components/incident-feed"
import { TerminalDock } from "@/components/terminal-dock"
import { AiChatbot } from "@/components/ai-chatbot"
import { ReasoningLogs } from "@/components/reasoning-logs"

interface AgentOutputs {
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
}

export default function EcoOpsCommandCenter() {
  const [threatLevel, setThreatLevel] = useState(6)
  const [dispatchArmed, setDispatchArmed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [agentOutputs, setAgentOutputs] = useState<AgentOutputs>({})

  const handleSeverityResult = useCallback(
    (data: { severity: number; final_report?: string; action_plan?: string[] }) => {
      setThreatLevel(data.severity)
      setDispatchArmed(true)
    },
    []
  )

  const handleAgentStep = useCallback((step: string, payload?: any) => {
    setCurrentStep(step)
    
    // Store agent output
    if (payload) {
      setAgentOutputs((prev) => ({
        ...prev,
        [step]: payload,
      }))
    }
    
    // Mark step as completed after a brief delay
    setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, step]))
      setCurrentStep(null)
    }, 500)
  }, [])

  const handleReset = useCallback(() => {
    setCompletedSteps(new Set())
    setCurrentStep(null)
    setAgentOutputs({})
    setDispatchArmed(false)
  }, [])

  const handleDispatch = useCallback(() => {
    if (dispatchArmed) {
      // Dispatch action
      console.log("Dispatching response unit...")
    }
  }, [dispatchArmed])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-eco-bg hex-grid-bg relative">
      {/* CRT Scanlines */}
      <div className="crt-scanlines" />

      {/* Header */}
      <CommandHeader
        threatLevel={threatLevel}
        dispatchArmed={dispatchArmed}
        onDispatch={handleDispatch}
      />

      {/* Main Body - Map + Incident Feed */}
      <div className="flex flex-1 min-h-0">
        {/* Center Map */}
        <div className="flex-1 p-2">
          <TacticalMap />
        </div>

        {/* Right Sidebar - Incident Feed */}
        <IncidentFeed />
      </div>

      {/* Bottom Dock - Three Panel Layout */}
      <div className="h-[30vh] flex border-t border-eco-border">
        {/* Left: Reasoning Logs */}
        <div className="w-80">
          <ReasoningLogs 
            completedSteps={completedSteps} 
            currentStep={currentStep}
            agentOutputs={agentOutputs}
          />
        </div>

        {/* Center: Field Terminal */}
        <div className="flex-1">
          <TerminalDock
            onSeverityResult={handleSeverityResult}
            onAgentStep={handleAgentStep}
            onReset={handleReset}
          />
        </div>

        {/* Right: AI Chatbot */}
        <div className="w-80">
          <AiChatbot />
        </div>
      </div>
    </div>
  )
}
