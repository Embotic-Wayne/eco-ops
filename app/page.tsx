"use client"

import { useState, useCallback } from "react"
import { CommandHeader } from "@/components/command-header"
import { TacticalMap } from "@/components/tactical-map"
import { IncidentFeed } from "@/components/incident-feed"
import { TerminalDock } from "@/components/terminal-dock"
import { AgentBriefings } from "@/components/agent-briefings"

export default function EcoOpsCommandCenter() {
  const [threatLevel, setThreatLevel] = useState(6)
  const [dispatchArmed, setDispatchArmed] = useState(false)

  const handleSeverityArmed = useCallback(() => {
    setThreatLevel(9)
    setDispatchArmed(true)
  }, [])

  const handleDispatch = useCallback(() => {
    if (dispatchArmed) {
      // Dispatch action
    }
  }, [dispatchArmed])

  return (
    <div className="w-screen flex flex-col bg-eco-bg hex-grid-bg relative">
      {/* CRT Scanlines */}
      <div className="crt-scanlines" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-50">
        <CommandHeader
          threatLevel={threatLevel}
          dispatchArmed={dispatchArmed}
          onDispatch={handleDispatch}
        />
      </div>

      {/* Section 1: Three Column Layout (viewport height minus header) */}
      <div className="flex h-[calc(100vh-56px)] min-h-[500px] border-b border-eco-border">
        {/* Left: Field Operative Terminal (Chat) */}
        <div className="flex-1 min-w-0">
          <TerminalDock onSeverityArmed={handleSeverityArmed} />
        </div>

        {/* Center: Agent Briefings */}
        <div className="w-[360px] border-x border-eco-border">
          <AgentBriefings />
        </div>

        {/* Right: Global Incident Feed */}
        <div className="w-[300px]">
          <IncidentFeed />
        </div>
      </div>

      {/* Section 2: Tactical Map (scrollable) */}
      <div className="h-[80vh] min-h-[500px]">
        <TacticalMap />
      </div>
    </div>
  )
}
