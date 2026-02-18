"use client"

import { useState, useCallback } from "react"
import { CommandHeader } from "@/components/command-header"
import { TacticalMap } from "@/components/tactical-map"
import { IncidentFeed } from "@/components/incident-feed"
import { TerminalDock } from "@/components/terminal-dock"

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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-eco-bg hex-grid-bg relative">
      {/* CRT Scanlines */}
      <div className="crt-scanlines" />

      {/* Header */}
      <CommandHeader
        threatLevel={threatLevel}
        dispatchArmed={dispatchArmed}
        onDispatch={handleDispatch}
      />

      {/* Main Body */}
      <div className="flex flex-1 min-h-0">
        {/* Center Map */}
        <div className="flex-1 p-2">
          <TacticalMap />
        </div>

        {/* Right Sidebar - Incident Feed */}
        <IncidentFeed />
      </div>

      {/* Bottom Dock - Terminal (25% height) */}
      <div className="h-[25vh]">
        <TerminalDock onSeverityArmed={handleSeverityArmed} />
      </div>
    </div>
  )
}
